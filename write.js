;
'use strict';

/**
 * Module solely to write rows to the database
 * <p>
 * License: Apache License v2.
 * 
 * @author xoykreme
 */

/**
 * Main module entry point
 * 
 * @param dbdetail
 *            database configuration options from the CLI
 * @param headers
 *            An array of the spreadsheet headers
 * @param rows
 *            An array of the spreadsheet rows
 */
exports.write = function(dbdetail,
                         headers,
                         rows) {
    write_processed_rows_to_database(dbdetail,
                                     headers,
                                     rows);
};

/**
 * Constructor function for instantiating temporary objects to store values from
 * each row from the Excel sheet
 */
function TempRowTemplate() {
    this._item_type = null;
    this._product_id = null;
    this._product_name = null;
    this._product_type = null;
    this._product_code_sku = null;
    this._bin_picking_number = null;
    this._brand_name = null;
    this._option_set = null;
    this._option_set_align = null;
    this._product_description = null;
    this._price = null;
    this._cost_price = null;
    this._retail_price = null;
    this._sale_price = null;
    this._fixed_shipping_cost = null;
    this._free_shipping = null;
    this._product_warranty = null;
    this._product_weight = null;
    this._product_width = null;
    this._product_height = null;
    this._product_depth = null;
    this._allow_purchases = null;
    this._product_visible = null;
    this._product_availability = null;
    this._track_inventory = null;
    this._current_stock_level = null;
    this._low_stock_level = null;
    this._category = null;
    this._product_image_url_1 = null;
    this._product_image_url_2 = null;
    this._product_image_url_3 = null;
    this._product_image_url_4 = null;
    this._product_image_url_5 = null;
    this._product_image_url_6 = null;
    this._search_keywords = null;
    this._page_title = null;
    this._meta_keywords = null;
    this._meta_description = null;
    this._myob_asset_acct = null;
    this._myob_income_acct = null;
    this._myob_expense_acct = null;
    this._product_condition = null;
    this._show_product_condition = null;
    this._event_date_required = null;
    this._event_date_name = null;
    this._event_date_is_limited = null;
    this._event_date_start_date = null;
    this._event_date_end_date = null;
    this._sort_order = null;
    this._product_tax_class = null;
    this._product_upc_ean = null;
    this._stop_processing_rules = null;
    this._product_url = null;
    this._redirect_old_url = null;
    this._gps_global_trade_item_number = null;
    this._gps_manufacturer_part_number = null;
    this._gps_gender = null;
    this._gps_age_group = null;
    this._gps_color = null;
    this._gps_size = null;
    this._gps_material = null;
    this._gps_pattern = null;
    this._gps_item_group_id = null;
    this._gps_category = null;
    this._gps_enabled = null;

    this.parent_id = null;
    this.parent_item_type = null;
}

/**
 * Convert spreadsheet headers into object key strings
 * <p>
 * Multiple spaces and non-alphanumeric characters are converted into single
 * dashes
 * 
 * @param titles
 *            An array of the spreadsheet headers
 * @returns {Array}
 */
function convert_titles_into_object_keys(titles) {
    var title, keys = [];
    while (titles.length) {
        title = titles.shift();
        title = title.toLowerCase();
        title = title.replace(/[^A-Z0-9 ]+/ig,
                              ' ');
        title = title.replace(/[ ]{2,}/g,
                              ' ').trim();
        title = title.replace(/[ ]+/g,
                              '_');
        keys.push(title);
    }
    return keys;
}

/**
 * Take db config params from CLI and instantiate knex query builder
 * 
 * @param connect_obj
 *            The db config params specified at runtime (CLI)
 * @returns {Object}
 */
function instantiate_querybuilder(connect_obj) {
    connect_obj.database = 'cw';
    connect_obj.charset = 'utf8';
    var knex = require('knex')({
        client : 'pg',
        connection : connect_obj
    });
    return knex;
}

/**
 * Transfer Excel row cells' values into an object
 * 
 * @param remaining_xls_rows
 *            Remaining unprocessed Excel rows
 * @param cleaned_xls_headers
 *            Excel column headers
 * @returns {TempRowTemplate}
 */
function map_xls_row_cells_to_skeleton_row(remaining_xls_rows,
                                           cleaned_xls_headers) {
    var xls_row = remaining_xls_rows[0];
    var cell_value;
    var this_row = new TempRowTemplate(); // 'this_row' here means current
    // spreadsheet row
    var modified_column_header;
    // loop through all cells in the row
    for (var i = 0; i < xls_row.length; i++) {
        cell_value = xls_row[i];
        if (cell_value !== null) { // not an empty cell
            cell_value = String(cell_value);
        }
        modified_column_header = '_' + cleaned_xls_headers[i];
        this_row[modified_column_header] = cell_value;
    }
    return this_row;
}

/**
 * There seems to be two types of rows in the spreadsheet, 'product's and 'sku's
 * <p>
 * The latter are variations of the fquerybuilderer (e.g. different size/colour
 * etc)
 * <p>
 * The latter also follows the fquerybuilderer so by 'looking ahead' we can
 * cache the parent's attributes as the sku rows seem to be having more empty
 * cells than the parent
 * <p>
 * It is thus assumed that the skus inherit their parent product's attributes
 * where their cells are empty
 * <p>
 * The cache won't change until the next row is a product
 * 
 * @param remaining_xls_rows
 *            Remaining unprocessed Excel rows
 * @param this_row
 *            Current spreadsheet row already mapped to column headers and cell
 *            values
 * @returns {TempRowTemplate}
 */
function cache_product_attributes_for_sku_rows(remaining_xls_rows,
                                               this_row) {
    var current_item_type = detect_this_row_type(remaining_xls_rows);
    var next_item_type = detect_next_item_type(remaining_xls_rows);
    if (current_item_type === 'product') {
        this_row.parent_id = (next_item_type === 'sku') ? this_row.product_id
                : null;
        this_row.parent_item_type = this_row.item_type;
    }
    return this_row;
}

/**
 * Helper function to detect current row's type
 * 
 * @param remaining_rows
 *            Remaining unprocessed Excel rows
 * @returns string
 */
function detect_this_row_type(remaining_rows) {
    var current_item_type = remaining_rows[0][0];

    if (typeof current_item_type !== 'string') {
        // sorry we can't have type-less rows
        throw new Error("Found item with no product type:\n"
                + JSON.stringify(remaining_rows[0]));
    }

    return current_item_type.toLowerCase().trim();
}

/**
 * Helper function to detect next row's type
 * 
 * @param remaining_rows
 *            Remaining unprocessed Excel rows
 * @returns string|null
 */
function detect_next_item_type(remaining_rows) {
    // if the next product is a SKU, store the parent product id
    if (typeof remaining_rows[1] !== 'undefined'
            && typeof remaining_rows[1][0] === 'string') {
        return remaining_rows[1][0].toLowerCase().trim();
    }

    return null;
}

/**
 * Empty function to store the current row in as a prototype.
 * <p>
 * We instantiate this to populate our missing sku rows
 */
function Product_sku_template() {
}

/**
 * Sku rows have lots of empty cells because the assumption is that the data can
 * be pulled from the product row (parent)
 * <p>
 * This function explicitly backfills those empty cells with product row's
 * values
 * 
 * @param remaining_rows
 *            Remaining unprocessed Excel rowss
 * @returns {TempRowTemplate}
 */
function fill_in_empty_cells_for_sku_row(remaining_rows,
                                         this_row) {
    var product_row_cached;
    if (detect_this_row_type(remaining_rows) === 'product') {
        Product_sku_template.prototype = this_row;
    } else { // sku
        product_row_cached = new Product_sku_template();
        for ( var key in this_row) {
            if (String(this_row[key]) === 'undefined'
                    || String(this_row[key]) === 'null') {
                this_row[key] = product_row_cached[key]; // backfill empty
                // cells; note
                // parent cell may
                // also be empty
            }
        }
    }
    return this_row;
}

/**
 * Map spreadsheet rows into an object
 * 
 * @param store
 *            A filled {TempRowTemplate} instance
 * @returns {Object}
 */
function build_mapped_row_object(store) {
    return {
        // composite primary key
        id : store._product_id.trim(),
        item_type : store._item_type.trim().toLowerCase(),

        name : store._product_name,
        type : (typeof store._product_type === 'string') ? store._product_type
                .trim() : null,
        sku : store._product_code_sku,
        bin_picking_number : store._bin_picking_number,
        option_set : store._option_set,
        option_set_align : store._option_set_align,
        description : store._product_description,
        warranty : store._product_warranty,
        weight : (typeof store._product_weight === undefined || store._product_weight === null) ? 0
                : store._product_weight * 1000,
        width : (typeof store._product_width === undefined || store._product_width === null) ? 0
                : store._product_width,
        height : (typeof store._product_height === undefined || store._product_height === null) ? 0
                : store._product_height,
        depth : (typeof store._product_depth === undefined || store._product_depth === null) ? 0
                : store._product_depth,
        allow_purchases : booleanise_yes_no(store._allow_purchases),
        is_visible : booleanise_yes_no(store._product_visible),
        category : store._category,
        image_url_1 : store._product_image_url_1,
        image_url_2 : store._product_image_url_2,
        image_url_3 : store._product_image_url_3,
        image_url_4 : store._product_image_url_4,
        image_url_5 : store._product_image_url_5,
        image_url_6 : store._product_image_url_6,
        search_keywords : store._search_keywords,
        page_title : store._page_title,
        meta_keywords : store._meta_keywords,
        meta_description : store._meta_description,
        myob_asset_account : store._myob_asset_acct,
        myob_income_account : store._myob_income_acct,
        myob_expenditure_account : store._myob_expense_acct,
        show_product_condition : store._show_product_condition,
        sort_order : (Number.isNaN(Number(store._sort_order))) ? null
                : Number(store._sort_order),
        ean : (typeof store._product_upc_ean === 'undefined' || store._product_upc_ean === null) ? ''
                : store._product_upc_ean.trim(),
        stop_processing_rules : booleanise_yes_no(store._stop_processing_rules),
        product_url : store._product_url,
        redirect_old_url : booleanise_yes_no(store._redirect_old_url),
        gps_gtin : store._gps_global_trade_item_number,
        gps_manufacturer_part_number : store._gps_manufacturer_part_number,
        gps_pattern : store._gps_pattern,
        gps_item_group_id : store._gps_item_group_id,
        gps_enabled : booleanise_yes_no(store._gps_enabled)
    };
}

/**
 * Prepare an object where the keys are the product table's foreign keys and the
 * values are the values to be compared against and inserted if necessary into
 * the foreign tables
 * 
 * @param store
 *            A filled {TempRowTemplate} instance
 * @returns {Object}
 */
function build_fk_map(store) {
    return {
        // fk column name : foreign key values
        brand_id : (typeof store._brand_name === 'undefined' || store._brand_name === null) ? null
                : store._brand_name.trim(),
        gps_age_group_id : store._gps_age_group,
        gps_category_id : store._gps_category,
        gps_colour_id : store._gps_colour,
        gps_gender_id : store._gps_gender,
        gps_material_id : store._gps_material,
        gps_size_id : store._gps_size,
        product_tax_class_id : store._product_tax_class,
        condition_id : store._product_condition
    };
}

/**
 * A product is a parent to a sku. We record that relationship in the
 * product_sku table
 * 
 * @param store
 *            A filled {TempRowTemplate} instance
 * @returns {Object}
 */
function build_product_sku_relation(store) {
    return {
        product_id : Number(store.parent_id),
        product_item_type : (typeof store.parent_item_type === 'string') ? store.parent_item_type
                .trim().toLowerCase()
                : null,
        sku_product_id : Number(store._product_id),
        sku_item_type : store._item_type.trim().toLowerCase()
    };
}

// referencing tables' values (already mapped to column names)

function build_pricing_object(store) {
    return {
        created : new Date().toJSON().replace('T',
                                              ' ')
                .replace(/^([^.]+)\.[0-9]+Z$/,
                         '$1'),
        price : integerise(store._price),
        costprice : integerise(store._cost_price),
        retailprice : integerise(store._retail_price),
        saleprice : integerise(store._sale_price),
        fixed_shipping_cost : integerise(store._fixed_shipping_cost),
        product_id : Number(store._product_id),
        product_item_type : store._item_type.trim().toLowerCase()
    };
}

function build_availability_object(store) {
    return {
        created : new Date().toJSON().replace('T',
                                              ' ')
                .replace(/^([^.]+)\.[0-9]+Z$/,
                         '$1'),
        availability : store._availablity,
        track_inventory : store._track_inventory,
        current_stock_level : Number(store._current_stock_level),
        low_stock_level : Number(store._low_stock_level),
        product_id : Number(store._product_id),
        product_item_type : store._item_type.trim().toLowerCase()
    };
}

function build_event_date_object(store) {
    return {
        required : booleanise_yes_no(store._event_date_required),
        name : store._event_date_name,
        is_limited : booleanise_yes_no(store._event_date_is_limited),
        start_date : parse_date(store._event_date_start_date),
        end_date : parse_date(store._event_date_start_date),
        product_id : Number(store._product_id),
        product_item_type : store._item_type.trim().toLowerCase()
    };
}

// prepare for persistence into Postgres

/**
 * Constructor for storing main row, referencing tables', foreign keys' and
 * product-sku table data
 * 
 * @param row
 *            Main row object with data already mapped
 * @param reference_pricing
 *            Object with referencing pricing table data already mapped
 * @param reference_availability
 *            Object with referencing availability table data already mapped
 * @param reference_event_date
 *            Object with referencing event date table data already mapped
 * @param mapped_foreign_keys
 *            Object with foreign key data already mapped
 * @param product_sku
 *            Object with product sku relationship data already mapped
 */
function Prepared_data(row,
                       reference_pricing,
                       reference_availability,
                       reference_event_date,
                       mapped_foreign_keys,
                       product_sku) {
    this.row = row;
    this.pricing = reference_pricing;
    this.availability = reference_availability;
    this.event_date = reference_event_date;
    this.foreign_keys_map = mapped_foreign_keys;
    this.product_sku = product_sku;
}

/**
 * Prepare database transaction data by mapping data values to various objects,
 * then returning a container object containing these processed objects
 * 
 * @param rows
 * @param headers
 * @returns {Prepared_data}
 */

function prepare_processed_data(rows,
                                headers) {

    var populated_row;
    var mapped_row;
    var pricing, availability, event_date;
    var foreign_keys_map;
    var product_sku_map;

    // map raw cells to temp object, and backfill any sku rows
    populated_row = map_xls_row_cells_to_skeleton_row(rows,
                                                      headers);
    populated_row = cache_product_attributes_for_sku_rows(rows,
                                                          populated_row);
    populated_row = fill_in_empty_cells_for_sku_row(rows,
                                                    populated_row);

    // build object with processed spreadsheet rows mapped to column names in
    // product table
    mapped_row = build_mapped_row_object(populated_row);

    // build referencing table objects
    pricing = build_pricing_object(populated_row);
    availability = build_availability_object(populated_row);
    event_date = build_event_date_object(populated_row);

    // build a mapping object containing foreign keys as object keys and
    // referencing column values as values
    foreign_keys_map = build_fk_map(populated_row);

    // build a mapping object linking any sku item with its product parent
    product_sku_map = build_product_sku_relation(populated_row);

    return new Prepared_data(mapped_row,
                             pricing,
                             availability,
                             event_date,
                             foreign_keys_map,
                             product_sku_map);

}

/**
 * Constructor containing referencing table data
 * 
 * @param tablename
 *            Referencing table name
 * @param columnname
 *            Referencing column name
 * @param product_fk_columnname
 *            Product foreign key column name
 */
function Fk_map(tablename,
                columnname,
                product_fk_columnname) {
    this.tablename = tablename;
    this.columnname = columnname;
    this.product_fk_columnname = product_fk_columnname;
}

function build_fk_map_collection() {

    var collection = [];

    collection.push(new Fk_map('brand',
                               'name',
                               'brand_id'));
    collection.push(new Fk_map('gps_age_group',
                               'age',
                               'gps_age_group_id'));
    collection.push(new Fk_map('gps_category',
                               'category',
                               'gps_category_id'));
    collection.push(new Fk_map('gps_colour',
                               'colour',
                               'gps_colour_id'));
    collection.push(new Fk_map('gps_gender',
                               'gender',
                               'gps_gender_id'));
    collection.push(new Fk_map('gps_material',
                               'material',
                               'gps_material_id'));
    collection.push(new Fk_map('gps_size',
                               'size',
                               'gps_size_id'));
    collection.push(new Fk_map('product_tax_class',
                               'tax_class',
                               'product_tax_class_id'));
    collection.push(new Fk_map('condition',
                               'condition',
                               'condition_id'));

    return collection;
}

/* ASYNC SECTION */

/**
 * Write processed spreadsheet data to database
 * 
 * @param connection_data
 *            CLI db connection parameters
 * @param spreadsheet_headers
 *            Array of spreadsheet headers
 * @param spreadsheet_rows
 */
function write_processed_rows_to_database(connection_data,
                                          spreadsheet_headers,
                                          spreadsheet_rows) {

    var querybuilder = instantiate_querybuilder(connection_data);
    var headers = convert_titles_into_object_keys(spreadsheet_headers);

    start_async_chain({
                          querybuilder : querybuilder,
                          headers : headers
                      },
                      function() {
                          return prepare_rows(spreadsheet_rows,
                                              this.headers);
                      }).map(do_transaction,
                             {
                                 concurrency : parseFloat("Infinity")
                             }).then(function() {
        process.exit(0);
    }).caught(verbose_error);

}

function prepare_rows(excel_rows,
                      excel_headers) {

    var prepared_rows = [];
    var rows_working_copy = cloner(excel_rows);

    while (rows_working_copy.length > 0) {
        prepared_rows.push(prepare_processed_data(rows_working_copy,
                                                  excel_headers));
        rows_working_copy.shift();
    }

    return prepared_rows;
}

function do_transaction(prepared) {

    // yeah have to 'cheat' a bit using closures
    // (i.e. a global variable to burst the perfectionist bubble :) )
    var querybuilder = this.querybuilder;

    return querybuilder.transaction(function(transaction_object) {

        return start_async_chain({
                                     prepared : prepared,
                                     querybuilder : querybuilder,
                                     transaction_object : transaction_object
                                 },
                                 function() {
                                     return build_fk_map_collection();
                                 }).map(get_foreign_table_primary_key)
                .then(load_foreign_keys_into_main_row)
                .then(check_if_product_exists).then(main_row_controller)
                .then(cache_composite_primary_key_for_new_rows)
                .then(build_referencing_array)
                .map(referencing_table_upsert_process).caught(verbose_error);

    }).then().caught(verbose_error);
}

/**
 * Stage one - get all foreign key data ready
 * 
 * @param query_builder
 *            The Knex object
 * @returns a thenable to pass on to stage two
 */

function get_foreign_table_primary_key(current_stage) {
    var fk_where = {};
    var key = current_stage.columnname;
    var value = this.prepared.foreign_keys_map[current_stage.product_fk_columnname];
    if (typeof value === 'undefined' || value === null) { // no point
        // inserting empty rows
        return;
    }
    fk_where[key] = value; // object with foreign table column name as key and
    // column value as value

    return start_async_chain({
                                 prepared : this.prepared,
                                 querybuilder : this.querybuilder,
                                 transaction_object : this.transaction_object,
                                 current_stage : current_stage
                             },
                             function() {
                                 return this
                                         .querybuilder(current_stage.tablename)
                                         .transacting(this.transaction_object)
                                         .forUpdate()
                                         .where(fk_where)
                                         .select('id')
                                         .bind(this)
                                         .then(insert_foreign_table_condition)
                                         .then(conditional_new_row_in_foreign_table)
                                         .then(prepare_individual_foreign_key);
                             });
}

function insert_foreign_table_condition(id) {

    this.insert_foreign_table = false;

    if (non_composite_primary_key_is_empty(id)) {
        this.insert_foreign_table = true;

        console.log('Inserting new row into foreign table '
                + this.current_stage.tablename);
    }

    return id;
}

function conditional_new_row_in_foreign_table(id) {

    if (this.insert_foreign_table === true) {

        var what_to_insert = {};
        what_to_insert[this.current_stage.columnname] = this.prepared.foreign_keys_map[this.current_stage.product_fk_columnname];

        return this.querybuilder(this.current_stage.tablename)
                .transacting(this.transaction_object).returning('id')
                .insert(what_to_insert);

    }
    return id;
}

function prepare_individual_foreign_key(foreign_table_primary_key) {
    var value;
    if (check_is_array(foreign_table_primary_key)) {
        value = foreign_table_primary_key.shift();
        if (typeof value === 'object' && typeof value.id !== 'undefined') {
            value = value.id;
        }
    }
    var indiv = {};
    indiv[this.current_stage.product_fk_columnname] = value;
    return indiv;
}

/**
 * Stage two, record found foreign keys (if any) in row object
 * 
 * @param query_builder
 *            The knex query builder
 * @param foreign_keys
 *            The array of found/generated foreign keys, if any
 * @return Promise
 */
function load_foreign_keys_into_main_row(foreign_keys) {

    var this_key;

    for (var i = 0; i < foreign_keys.length; i++) {

        if (typeof foreign_keys[i] !== 'undefined' && foreign_keys[i] !== null) {
            this_key = Object.keys(foreign_keys[i])[0];
            this.prepared.row[this_key] = foreign_keys[i][this_key];
        }

    }

    return {
        id : this.prepared.row.id,
        item_type : this.prepared.row.item_type
    };
}

function check_if_product_exists(current_product_composite_primary_key) {

    return this.querybuilder('product').transacting(this.transaction_object)
            .forUpdate().where(current_product_composite_primary_key)
            .select('id',
                    'item_type');

}

function main_row_controller(current_product_composite_primary_key) {

    this.composite_primary_key = null;

    if (composite_primary_key_is_not_empty(current_product_composite_primary_key)) {

        // cache composite key
        this.composite_primary_key = current_product_composite_primary_key[0];

        console.log("Updated " + this.composite_primary_key.item_type
                + " with id " + this.composite_primary_key.id);

        // update existing row
        return this.querybuilder('product')
                .transacting(this.transaction_object)
                .where(this.composite_primary_key).update(this.prepared.row);
    }

    // insert new row
    return this.querybuilder('product').transacting(this.transaction_object)
            .returning('id').insert(this.prepared.row);

}

function cache_composite_primary_key_for_new_rows(id) {

    if (this.composite_primary_key === null) {// yes this is a new row

        this.composite_primary_key = {
            id : Number(id),
            item_type : this.prepared.row.item_type
        };

        console.log("Inserted " + this.composite_primary_key.item_type
                + " with id " + this.composite_primary_key.id);

    }
}

/**
 * Stage three, record referencing pricing, availability and event_date table
 * data
 */

function build_referencing_array() {
    return [ {
        pricing : this.prepared.pricing
    }, {
        availability : this.prepared.availability
    }, {
        event_date : this.prepared.event_date
    } ];
}

function duplicate_context(that) {
    var cloned = {};
    for ( var key in that) {
        cloned[key] = that[key];
    }
    return cloned;
}

function referencing_table_upsert_process(referencing_table_object) {

    this.referencing_table_name = Object.keys(referencing_table_object)[0];
    this.referencing_table_data = referencing_table_object[this.referencing_table_name];

    // cache product table composite key first
    this.referencing_table_data.product_id = this.prepared.row.id;
    this.referencing_table_data.product_item_type = this.prepared.row.item_type;

    var where_product_fk = {
        product_id : this.prepared.row.id,
        product_item_type : this.prepared.row.item_type
    };

    var context = duplicate_context(this);

    return this.querybuilder(this.referencing_table_name)
            .transacting(this.transaction_object).forUpdate()
            .where(where_product_fk).orderBy('created',
                                             'desc').limit(1).bind(context)
            .then(cache_searched_row).then(init_insert_new_row_detector)
            .then(referencing_table_compare_latest_row)
            .then(referencing_table_conditional_insert)
            .then(conditionally_note_no_action);
}

function cache_searched_row(searched_row) {
    this.searched_row = searched_row.shift();
}

function init_insert_new_row_detector() {
    this.insert_new_row = false;
}

function referencing_table_compare_latest_row() {

    // check if we already have an existing row
    if (typeof this.searched_row !== 'undefined') { // yes we do

        // compare existing row to spreadsheet data
        for ( var key in this.searched_row) {

            // can skip comparison for these common keys
            if (key === 'id' || key === 'product_id'
                    || key === 'product_item_type' || key === 'created') {
                continue;
            }

            if (typeof this.prepared[this.referencing_table_name][key] === 'undefined') {
                // even out comparison fields
                this.prepared[this.referencing_table_name][key] = null;
            }

            // they're not the same... insert new row
            if (this.prepared[this.referencing_table_name][key] !== this.searched_row[key]) {
                this.insert_new_row = true;
                return;
            }
        }
    } else { // no we don't, insert please
        this.insert_new_row = true;
    }
}

function referencing_table_conditional_insert() {

    // insert new referencing table row
    if (this.insert_new_row === true) {

        console.log('\tInserted new row in ' + this.referencing_table_name);

        return this.querybuilder(this.referencing_table_name)
                .transacting(this.transaction_object)
                .insert(this.referencing_table_data);
    }
}

function conditionally_note_no_action() {

    if (this.insert_new_row === false) {

        // no difference with latest row
        console.log('\tNo difference with latest row in '
                + this.referencing_table_name + ' table');
    }
}

/* UTILS */

function start_async_chain(data,
                           func) {
    var Promise = require('bluebird');
    // yeah hack needed, Promise.promisify(func).bind() doesn't work
    return Promise.delay(0).bind(data).then(func);
}

function cloner(clonee) {
    return JSON.parse(JSON.stringify(clonee));
}

function booleanise_yes_no(value) {
    return (typeof value === 'string' && value.trim().toLowerCase() === 'y');
}

function integerise(value) {
    return Number(String(value).replace(/[^0-9]+/g,
                                        ''));
}

function parse_date(value) {
    value = String(value).trim();
    return (/^[0-9]{2}([0-9]{2}-){2}[0-9]{2}\s([0-9]{2}:){2}[0-9]{2}$/g
            .test(value)) ? value : null;
}

function check_is_array(input) {
    return typeof input === 'object' && typeof input.length === 'number';
}

function verbose_error(err) {
    console.log(err.stack);
    process.exit(1);
}

function non_composite_primary_key_is_empty(pk) {
    return (typeof pk === 'undefined' || pk === null || pk.length === 0 || typeof pk.length === 'undefined');
}

function composite_primary_key_is_not_empty(composite_pk) {
    return typeof composite_pk === 'object'
            && typeof composite_pk[0] === 'object'
            && typeof composite_pk[0].id === 'number'
            && typeof composite_pk[0].item_type === 'string'
            && composite_pk[0].item_type.length > 0;
}
