;
'use strict';

/**
 * Module solely to write rows to the database
 * <p>
 * License: Apache License v2.
 * 
 * @author xoykreme
 */

var longjohn = require('longjohn');

exports.write = function(dbdetail, headers, rows) {
    var obj_keys, orm;
    obj_keys = convert_titles_into_object_keys(headers);
    orm = instantiate_orm(dbdetail);
    dump_into_database(obj_keys, orm, rows);
};

function convert_titles_into_object_keys(titles) {
    var title, keys = [];
    while (titles.length) {
        title = titles.shift();
        title = title.toLowerCase();
        title = title.replace(/[^A-Z0-9 ]+/ig, ' ');
        title = title.replace(/[ ]{2,}/g, ' ').trim();
        title = title.replace(/[ ]+/g, '_');
        keys.push(title);
    }
    return keys;
}

function instantiate_orm(connect_obj) {
    connect_obj.database = 'cw';
    connect_obj.charset = 'utf8';
    var knex = require('knex')({
        client : 'pg',
        connection : connect_obj
    });
    return require('bookshelf')(knex);
}

function dump_into_database(keys, db, data_array) {

    var Dump = function() {
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
    };

    var i, j, key, current_item_type, output, next_item, mapped, populated_dump, mapped_referencing_tables, fk_mapped, product_sku_mapped;

    // tables that reference product
    var pricing, availability, event_date;
    var Product_sku = function() {
    };

    for (i = 0; i < data_array.length; i++) {
        populated_dump = new Dump();
        for (j = 0; j < keys.length; j++) {
            output = data_array[i][j];
            if (output !== null) {
                output = String(output);
            }
            key = '_' + keys[j];
            populated_dump[key] = output;

            if (j === 0) {
                current_item_type = data_array[i][0].toLowerCase().trim();
                // if next product is a SKU store the parent product id
                if (typeof data_array[(i + 1)] !== 'undefined') {
                    next_item = data_array[(i + 1)][0].toLowerCase().trim();
                    // temporarily mark it as true if next item is a SKU child and current item is a product
                    if (current_item_type === 'product') {
                        populated_dump.parent_id = (next_item === 'sku') ? true : null;
                    }
                }
            }

        }

        if (current_item_type === 'product') {
            if (populated_dump.parent_id === true) { // we know that the next item is a SKU child so we store parent id
                populated_dump.parent_id = populated_dump._product_id;
                populated_dump.parent_item_type = populated_dump._item_type;
            }
            Product_sku.prototype = populated_dump;
        } else { // sku
            sku_proto = new Product_sku();
            for ( var key in populated_dump) {
                if (String(populated_dump[key]).trim() === 'undefined' || String(populated_dump[key]).trim() === 'null') {
                    populated_dump[key] = sku_proto[key]; // backfill empty cells; note parent cell may also be empty
                }
            }
        }

        // map populated_dump object to db column names
        mapped = build_mapped_row_object(populated_dump);

        // build referencing table objects
        pricing = build_pricing_object(populated_dump);
        availability = build_availability_object(populated_dump);
        event_date = build_event_date_object(populated_dump);

        // write main row to (or update) db, then to referencing tables, all in one transaction
        mapped_referencing_tables = [ {
            pricing : pricing
        }, {
            availability : availability
        }, {
            event_date : event_date
        } ];

        fk_mapped = build_fk_map(populated_dump);
        product_sku_mapped = build_product_sku_relation(populated_dump);

        write_to_db(db, mapped, mapped_referencing_tables, fk_mapped, product_sku_mapped);
    }
}

function build_mapped_row_object(store) {
    return {
        // composite primary key
        id : store._product_id.trim(),
        item_type : store._item_type.trim().toLowerCase(),

        name : store._product_name,
        type : (typeof store._product_type === 'string') ? store._product_type.trim() : null,
        sku : store._product_code_sku,
        bin_picking_number : store._bin_picking_number,
        option_set : store._option_set,
        option_set_align : store._option_set_align,
        description : store._product_description,
        warranty : store._product_warranty,
        weight : (typeof store._product_weight === undefined || store._product_weight === null) ? 0 : store._product_weight * 1000,
        width : (typeof store._product_width === undefined || store._product_width === null) ? 0 : store._product_width,
        height : (typeof store._product_height === undefined || store._product_height === null) ? 0 : store._product_height,
        depth : (typeof store._product_depth === undefined || store._product_depth === null) ? 0 : store._product_depth,
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
        sort_order : (Number.isNaN(Number(store._sort_order))) ? null : Number(store._sort_order),
        ean : (typeof store._product_upc_ean === 'undefined' || store._product_upc_ean === null) ? '' : store._product_upc_ean.trim(),
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

function build_fk_map(store) {
    return {
        // fk column name : foreign key values
        brand_id : (typeof store._brand_name === 'undefined' || store._brand_name === null) ? null : store._brand_name.trim(),
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

function build_product_sku_relation(store) {
    return {
        product_id : Number(store.parent_id),
        product_item_type : (typeof store.parent_item_type === 'string') ? store.parent_item_type.trim().toLowerCase() : null,
        sku_product_id : Number(store._product_id),
        sku_item_type : store._item_type.trim().toLowerCase()
    };
}

// referencing tables' values (already mapped to column names)

function build_pricing_object(store) {
    return {
        created : new Date().toJSON().replace('T', ' ').replace(/^([^.]+)\.[0-9]+Z$/, '$1'),
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
        created : new Date().toJSON().replace('T', ' ').replace(/^([^.]+)\.[0-9]+Z$/, '$1'),
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

// utils

function booleanise_yes_no(value) {
    return (typeof value === 'string' && value.trim().toLowerCase() === 'y');
}

function integerise(value) {
    return Number(String(value).replace(/[^0-9]+/g, ''));
}

function parse_date(value) {
    value = String(value).trim();
    return (/^[0-9]{2}([0-9]{2}-){2}[0-9]{2}\s([0-9]{2}:){2}[0-9]{2}$/g.test(value)) ? value : null;
}

function write_to_db(dbconnect, mapped_object, secondary_sequence, hashtable_fk, hashtable_product_sku) {

    var primary_sequence = [];
    // tablename, columnname, product's fk, mapped object (for first insert/update)/null (for fk updates)
    primary_sequence.push([ 'brand', 'name', 'brand_id', mapped_object ]);
    primary_sequence.push([ 'gps_age_group', 'age', 'gps_age_group_id', null ]);
    primary_sequence.push([ 'gps_category', 'category', 'gps_category_id', null ]);
    primary_sequence.push([ 'gps_colour', 'colour', 'gps_colour_id', null ]);
    primary_sequence.push([ 'gps_gender', 'gender', 'gps_gender_id', null ]);
    primary_sequence.push([ 'gps_material', 'material', 'gps_material_id', null ]);
    primary_sequence.push([ 'gps_size', 'size', 'gps_size_id', null ]);
    primary_sequence.push([ 'product_tax_class', 'tax_class', 'product_tax_class_id', null ]);
    primary_sequence.push([ 'condition', 'condition', 'condition_id', null ]);

    persist(dbconnect, mapped_object, primary_sequence, secondary_sequence, hashtable_fk, hashtable_product_sku);
}

// database transaction

function persist(orm, hashtable, primary_sequence_array, secondary_sequence_array, fk_hashtable, product_sku_hashtable) {

    var Promise, current_stage_in_sequence;

    Promise = require('bluebird');

    orm.transaction(transaction_main).then(function(orm_intact) {
    })['catch'](function(err) {
        console.log(err);
        console.log(hashtable);
    });

    /**
     * The main transactional (recursive) megafunction. Inserts/updates old/new rows with old/new fks.
     * 
     * @todo: break this down into smaller functions
     * @todo: refactor to minimise use of global variables
     */
    function transaction_main(trx) {

        // recursion controller

        if (typeof primary_sequence_array === 'object' && primary_sequence_array.length === 0) { // done with primary row & fks
            return transaction_secondary_referencing_tables(trx); // now do referencing tables
        }

        // inits

        if (typeof current_stage_in_sequence === 'undefined' || primary_sequence_array.length >= 1) {
            current_stage_in_sequence = primary_sequence_array.shift();
        }

        var tablename = current_stage_in_sequence[0];
        var columnname = current_stage_in_sequence[1];
        var foreign_key = current_stage_in_sequence[2];// product.<foreign_key_name>
        var single_row_mapped_to_columns = current_stage_in_sequence[3];

        var composite_key = {
            id : hashtable.id,
            item_type : hashtable.item_type
        };

        var fk_key_value_pair = {};
        fk_key_value_pair[columnname] = fk_hashtable[foreign_key];

        if (fk_key_value_pair[columnname] === null || typeof fk_key_value_pair[columnname] === 'undefined') {
            return transaction_main(trx);
        }

        // 4 scenarios (row from now on refers to the product table):
        // a) no fk (foreign key) + new row (insert row)
        // b) no fk + old row (eg the fk was erased earlier or non existent and we have a new value now - update row)
        // c) found existing fk + new row (insert row)
        // d) found existing fk + old row (update row)
        // Also, is the intent based on the entire row or just the fk column only?

        return trx.where(fk_key_value_pair).select('id').from(tablename).then(function(id) {

            // id is either an array with an object inside, e.g. [{id:1}] or an empty array
            if (primary_key_is_empty(id)) { // no fk

                return trx.where(composite_key).select('id', 'product').from('product').then(function(theproduct) {

                    if (primary_key_is_empty(theproduct)) { // no fk + new row (scenario a)

                        return trx.insert(fk_key_value_pair).into(tablename).then(function(model) { // intent is to insert the entire row

                            return Promise.map([ single_row_mapped_to_columns ], function(row) {
                                row[columnname] = fk_hashtable[foreign_key];
                                return trx.insert(row).into('product').then(function(model) {
                                    console.log("New product id: '" + hashtable.id + "', item type '" + hashtable.item_type + "' inserted");
                                    return transaction_main(trx);
                                });
                            });

                        });

                    } else { // no fk + old row (scenario b)

                        // insert into target table to get the fk
                        return trx.insert(fk_key_value_pair).into(tablename).then(function(fk_id) {

                            if (single_row_mapped_to_columns === null) { // intent is to just update the fk

                                return Promise.map([], function(row) {
                                    // just update the fk column in the existing row
                                    row[columnname] = fk_hashtable[foreign_key];
                                    return trx('product').where(composite_key).update(row).then(function(model) {
                                        console.log("Existing product id: '" + hashtable.id + "', item type '" + hashtable.item_type + "' has had foreign key column '" + foreign_key + "' updated");
                                        return transaction_main(trx);
                                    });
                                });

                            } else { // intent is to update the entire row

                                return Promise.map([ single_row_mapped_to_columns ], function(row) {
                                    // update entire row (along with the fk)
                                    row[columnname] = fk_hashtable[foreign_key];
                                    return trx('product').where(composite_key).update(row).then(function(model) {
                                        console.log("Existing product id: '" + hashtable.id + "', item type '" + hashtable.item_type + "' is updated, along with foreign key column '" + foreign_key + "'");
                                        return transaction_main(trx);
                                    });
                                });

                            }
                        });

                    }
                });

            } else { // we have an existing fk

                var existing_fk_id = Number(id[0].id);

                return trx.where(composite_key).select('id', 'item_type').from('product').then(function(composite_pk) {

                    if (primary_key_is_empty(composite_pk)) { // existing fk + new row (scenario c)

                        single_row_mapped_to_columns[foreign_key] = existing_fk_id;
                        return Promise.map([ single_row_mapped_to_columns ], function(row) { // intent is to insert the entire row
                            row[columnname] = Number(existing_fk_id);
                            return trx.insert(row).into('product').then(function(model) {
                                console.log("New product id: '" + hashtable.id + "', item type '" + hashtable.item_type + "' inserted with existing foreign key column '" + foreign_key + "'");
                                return transaction_main(trx);
                            });
                        });

                    } else { // existing fk + old row (scenario d)

                        if (single_row_mapped_to_columns === null) {// intent is to just update the fk
                            return trx('product').where(composite_key).update(foreign_key, existing_fk_id).then(function(model) {
                                console.log("Existing foreign key column '" + foreign_key + "' is updated for product id: '" + hashtable.id + "'");
                                return transaction_main(trx);
                            });
                        } else {
                            single_row_mapped_to_columns[foreign_key] = existing_fk_id;
                            return trx('product').where(composite_key).update(single_row_mapped_to_columns).then(function(model) {
                                console.log("Existing product id: '" + hashtable.id + "', item type '" + hashtable.item_type + "' is updated, along with existing foreign key column '" + foreign_key + "'");
                                return transaction_main(trx);
                            });
                        }

                    }
                });
            }

        });
    }

    /**
     * The second stage in the db transaction - inserting/updating referencing tables.
     * 
     * @todo: break this down into smaller functions
     * @todo: refactor to minimise use of global variables
     */
    function transaction_secondary_referencing_tables(tx) {

        var referencing_tablename, referencing_store, current_stage_in_secondary_sequence, continue_after_inserting_new_row;

        // recursion controller

        if (typeof secondary_sequence_array === 'object' && secondary_sequence_array.length === 0) {
            return transaction_final_product_sku_relations(tx);
        }

        // init

        if (typeof current_stage_in_secondary_sequence === 'undefined' || secondary_sequence_array.length >= 1) {
            current_stage_in_secondary_sequence = secondary_sequence_array.shift();
        }

        referencing_tablename = Object.keys(current_stage_in_secondary_sequence)[0];
        referencing_store = current_stage_in_secondary_sequence[referencing_tablename];

        continue_after_inserting_new_row = function(_tablename, _primary_hashtable, _secondary_store, trxn) {

            return tx(_tablename).insert(_secondary_store).then(function(_table) {

                console.log("New row inserted into '" + _tablename + "' for product id '" + _primary_hashtable.id + "', item_type '" + _primary_hashtable.item_type + "'");
                return transaction_secondary_referencing_tables(trxn);

            });

        };

        // check if row exists
        return tx(referencing_tablename).where({
            product_id : hashtable.id,
            product_item_type : hashtable.item_type
        }).select().orderBy('created', 'desc').limit(1).then(function(model1) {

            if (primary_key_is_empty(model1)) { // no, it's a new row

                continue_after_inserting_new_row(referencing_tablename, hashtable, referencing_store, tx);

            } else { // yes it exists...

                var matches = true;
                for ( var key in referencing_store) { // do the current and previous rows match?
                    // @todo: don't hardcode :)
                    if (key === 'id' || key === 'created') {// skip, n/a
                        continue;
                    }
                    if (typeof model1[0][key] === 'undefined') {
                        model1[0][key] = null; // even out the playing field
                    }
                    if (referencing_store[key] !== model1[0][key]) {
                        console.log(key + ' [' + typeof referencing_store[key] + '] [' + typeof model1[0][key] + '] : ' + referencing_store[key] + " vs " + model1[0][key]);
                        matches = false;
                        break; // ...but it doesn't match
                    }
                }

                if (!matches) {
                    continue_after_inserting_new_row(referencing_tablename, hashtable, referencing_store, tx);
                }// otherwise staying put
            }
        });
    }

    /**
     * The last stage in the db transaction - inserting into the product_sku table.
     * 
     * @todo: break this down into smaller functions
     * @todo: refactor to minimise use of global variables
     */

    function transaction_final_product_sku_relations(trnxn) {
        return trnxn.where(product_sku_hashtable).select().from('product_sku').then(function(product_sku_row) {
            if (primary_key_is_empty(product_sku_row) && product_sku_hashtable.product_id !== null && product_sku_hashtable.product_id !== product_sku_hashtable.sku_product_id && product_sku_hashtable.product_item_type !== product_sku_hashtable.sku_item_type) {
                return trnxn.insert(product_sku_hashtable).into('product_sku').then(function(product_sku_model) {
                    console.log("Created product-sku relation: '" + JSON.stringify(product_sku_hashtable) + "'");
                    return trnxn;
                });
            }
            return trnxn;
        });
    }
};

function primary_key_is_empty(pk) {
    return (pk.length === 0 || pk.length === 'undefined');
}
