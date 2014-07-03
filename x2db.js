;
'use strict';

/**
 * x2db.js xls2database: xls reader + postgresql writer
 * <p>
 * License: Apache License v2.
 * 
 * @author xoykreme
 */

// main
(function() {
    var xls = require('xlsjs'), writer = require('./write.js');
    var cli_opt, xlsfilepath, dbdata, workbook, first_sheet, titles, built;
    try {
        cli_opt = init_cli_opt();
        xlsfilepath = get_filepath(cli_opt);
        dbdata = get_db_details_prototype_object(cli_opt);
        if (filepath_exists(xlsfilepath)) {
            workbook = get_workbook(xlsfilepath);
            first_sheet = workbook.Sheets[workbook.SheetNames[0]];
            titles = cache_titles(first_sheet);
            built = build_rows(first_sheet);
            writer.write(dbdata,
                         titles,
                         built);
        }
    } catch (e) {
        console.log(e.stack);
        process.exit(1);
    }

})();

// cli options
function init_cli_opt() {
    var opt = require('node-getopt'), params = [];
    params.push([ 'f', '', 'File path' ]);
    params.push([ '', 'host', 'Database host' ]);
    params.push([ '', 'user', 'Database user name' ]);
    params.push([ '', 'pass', 'Database user password' ]);
    params.push([ 'h', 'help', 'Show this help message' ]);
    opt = opt.create(params).bindHelp().parseSystem();
    return opt;
}

function get_filepath(opt) {
    var filepath, each, counter = 0;
    for (each in opt.options) {
        if (typeof each !== 'undefined' && each === 'f') {
            filepath = opt.argv[counter];
            break;
        }
        ++counter;
    }
    if (typeof filepath === 'undefined') {
        throw new Error('Please supply a filepath.');
    }
    return filepath;
}

function get_db_details_prototype_object(opt) {
    var each, counter = 0, host, user, pass;
    for (each in opt.options) {
        if (typeof each !== 'undefined') {
            if (each === 'user') {
                user = opt.argv[counter];
            } else if (each === 'pass') {
                pass = opt.argv[counter];
            } else if (each === 'host') {
                host = opt.argv[counter];
            }
        }
        ++counter;
    }
    if (typeof host === 'undefined' || typeof user === undefined || typeof pass === 'undefined') {
        throw new Error("Please enter your database username, password and/or host ip address.");
    }
    return {
        'host' : host,
        'user' : user,
        'password' : pass
    };
}

// check file
function filepath_exists(filepath) {
    var fs = require('fs');
    var exists = fs.existsSync(filepath);
    if (!exists) {
        throw new Error("File '" + filepath + "' does not exist.");
    }
    return true;
}

// check spreadsheet
function get_workbook(filepath) {
    var xls = require('xlsjs');
    var wb;
    try {
        wb = xls.readFile(filepath);
    } catch (e) {
        throw new Error("File '" + filepath + "' does not have a valid Excel workbook.");
    }
    return wb;
}

// capture titles
function cache_titles(sheet) {
    var titles = [], current_cell_name;
    for (current_cell_name in sheet) {
        if (is_title_row(current_cell_name)) {
            titles.push(sheet[current_cell_name]['v']);
        }

        // finished with collecting titles
        if (current_cell_name === 'A2') {
            return titles;
        }
    }
}

// capture rows
function build_rows(sheet) {

    var rows = [], row = [], row_index, prev_cell_name, current_cell_name, non_title_row_pattern;

    for (current_cell_name in sheet) {

        if (is_title_row(current_cell_name)) {
            continue;
        }

        if (current_cell_name === 'A2') {
            row_index = 2;
        }

        // things that we need to do when it's a new row
        if (is_new_row(current_cell_name,
                       row_index)) {
            prev_cell_name = undefined; // reset cached previous cell name
            if (row.length) {
                rows.push(row);// cache row
            }
            row = []; // reset current row
            // increment row index if necessary
            if (current_cell_name !== 'A' + row_index) {
                row_index++;
            }
        }

        // check if cell is member of row
        non_title_row_pattern = '[A-Z]+' + row_index;
        if (new RegExp(non_title_row_pattern).test(current_cell_name)) {
            // join cell to row (and fill in any blank cells)
            row = backfill_if_necessary(prev_cell_name,
                                        current_cell_name,
                                        row);
            row.push(sheet[current_cell_name]['v']);
            prev_cell_name = current_cell_name;
        }

    }
    return rows;
}

function is_title_row(current_cell) {
    return /^[A-Z]+1$/.test(current_cell);
}

// detect if it's a new row
function is_new_row(current_cell, current_counter) {
    return (current_cell === 'A' + current_counter || /^A[0-9]+$/.test(current_cell));
}

/**
 * Backfill empty cells between a given range, e.g. AA2 and AF2. Rolling my own empty cell filler because xlsjs mostly doesn't include 'empty cells' (which are actually virtual). xlsjs does have a sheet_to_csv() option but the csv parsers out there aren't documented properly so think it's easier to use a home-grown solution
 * 
 * @param previous_cell_ref
 *            Last known good cell name e.g. AA2
 * @param current_cell_ref
 *            Current cell name e.g. AF2
 * @param current_row
 *            The current row array
 * @returns If there was a need to backfill the row, the backfilled row array will be returned, otherwise the original row array is returned
 */
function backfill_if_necessary(previous_cell_ref, current_cell_ref, current_row) {

    // e.g. backfill between AAA & ZZZ
    // first strip out row numbers
    previous_cell_ref = (typeof previous_cell_ref === 'undefined') ? '@' : previous_cell_ref.replace(/[0-9]+/,
                                                                                                     '');
    current_cell_ref = current_cell_ref.replace(/[0-9]+/,
                                                '');

    var distances = [], prev_last_char, current_last_char;
    var lower = previous_cell_ref.length, upper = current_cell_ref.length;
    var is_continuation_of_row = /^[A]+$/g.test(current_cell_ref);

    // calculate how many empty skipped spaces we have to fill
    for (var i = -1, j = 0 - lower; i >= j; i--) {
        prev_last_char = previous_cell_ref.substr(i,
                                                  1);
        current_last_char = current_cell_ref.substr(i,
                                                    1);
        distances.push(calculate_distance(prev_last_char,
                                          current_last_char));
    }

    // e.g. backfill between A & ZZZ (extreme example but just to prove a point)
    if (lower < upper && !is_continuation_of_row) {
        for (i = 0,
             j = upper - lower; i < j; i++) {
            distances.push(26);// entire alphabet
        }
    }

    // actual backfilling (with null objects)
    for (i = 0; i < distances.length; i++) {
        for (j = 1 /* at least 2 letters away to qualify */; j < distances[i]; j++) {
            current_row.push(null);
        }
    }
    return current_row;
}

/**
 * Find how many characters exist between two letters
 * 
 * @param previous_char
 *            First letter
 * @param current_char
 *            Second letter
 * @returns Number
 */
function calculate_distance(previous_char, current_char) {
    if (typeof previous_char === 'undefined') {
        previous_char = '@';// code 64, just before 'A' (code 65)
    }
    return current_char.charCodeAt(0) - previous_char.charCodeAt(0);
}
