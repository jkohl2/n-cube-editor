var NCubeEditor2 = (function ($) {

    var headerAxisNames = ['trait','traits','businessDivisionCode','bu','month','months','col','column','cols','columns'];
    var nce = null;
    var hot = null;
    var numColumns = 0;
    var numRows = 0;
    var cubeName = null;
    var axes = null;
    var colOffset = null;
    var data = null;
    var prefixes = null;
    var cubeMap = null;
    var cubeMapRegex = null;
    var axisColumnMap = null;
    var _columnWidths = [];
    var _cellId = null;
    var _tableCellId = null;
    var _columnList = null;
    var _hideColumnsList = null;
    var _hiddenColumns = {};
    var _editCellModal = null;
    var _editCellValue = null;
    var _editCellCache = null;
    var _editCellRadioURL = null;
    var _editColumnModal = null;
    var _valueDropdown = null;
    var _urlDropdown = null;
    var _colIds = -1;   // Negative and gets smaller (to differentiate on server side what is new)
    var _clipboard = null;
    var _clipFormat = CLIP_NCE;
    var _searchField = null;
    var _searchCoords = null;
    var _currentSearchResultIndex = null;
    var _ncubeContent = null;
    var _ncubeHtmlError = null;
    var _bufferText = null;
    var _firstRenderedCol = null;
    var _defaultCellText = null;
    var _axisName = null;
    var _isRefAxis = null;
    var _hasRefFilter = null;
    var _addAxisName = null;
    var _addAxisTypeName = null;
    var _addAxisValueTypeName = null;
    var _refAxisGroup = null;
    var _refAxisBranch = null;
    var _refAxisStatus = null;
    var _refAxisApp = null;
    var _refAxisVersion = null;
    var _refAxisCube = null;
    var _refAxisAxis = null;
    var _refFilterGroup = null;
    var _refFilterBranch = null;
    var _refFilterStatus = null;
    var _refFilterApp = null;
    var _refFilterVersion = null;
    var _refFilterCube = null;
    var _refFilterMethod = null;
    var _isRefAxisUpdate = null;
    var _hasRefFilterUpdate = null;
    var _updateAxisName = null;
    var _updateAxisTypeName = null;
    var _updateAxisValueTypeName = null;
    var _updateAxisSortOrder = null;
    var _refAxisGroupUpdate = null;
    var _refAxisBranchUpdate = null;
    var _refAxisStatusUpdate = null;
    var _refAxisAppUpdate = null;
    var _refAxisVersionUpdate = null;
    var _refAxisCubeUpdate = null;
    var _refAxisAxisUpdate = null;
    var _refFilterGroupUpdate = null;
    var _refFilterBranchUpdate = null;
    var _refFilterStatusUpdate = null;
    var _refFilterAppUpdate = null;
    var _refFilterVersionUpdate = null;
    var _refFilterCubeUpdate = null;
    var _refFilterMethodUpdate = null;
    var _topAxisBtn = null;
    var _filterModal = null;
    var _filters = null;
    var _filterTable = null;
    var _columnIdCombinationsToShow = null;

    var init = function(info) {
        if (!nce) {
            nce = info;

            _columnList = $('#editColumnsList');
            _hideColumnsList = $('#hideColumnsList');
            _editCellModal = $('#editCellModal');
            _editCellValue = $('#editCellValue');
            _editCellCache = $('#editCellCache');
            _editCellRadioURL = $('#editCellRadioURL');
            _editColumnModal = $('#editColumnsModal');
            _valueDropdown = $('#datatypes-value');
            _urlDropdown = $('#datatypes-url');
            _clipboard = $('#cell-clipboard');
            _searchField = document.getElementById('search-field');
            _ncubeContent = $('#ncube-content');
            _ncubeHtmlError = $('#ncube-error');
            _isRefAxis = $('#isRefAxis');
            _hasRefFilter = $('#hasRefFilter');
            _addAxisName = $('#addAxisName');
            _addAxisTypeName = $('#addAxisTypeName');
            _addAxisValueTypeName = $('#addAxisValueTypeName');
            _refAxisGroup = $('#refAxisGroup');
            _refAxisBranch = $('#refAxisBranch');
            _refAxisStatus = $('#refAxisStatus');
            _refAxisApp = $('#refAxisApp');
            _refAxisVersion = $('#refAxisVersion');
            _refAxisCube = $('#refAxisCube');
            _refAxisAxis = $('#refAxisAxis');
            _refFilterGroup = $('#refFilterGroup');
            _refFilterBranch = $('#refFilterBranch');
            _refFilterStatus = $('#refFilterStatus');
            _refFilterApp = $('#refFilterApp');
            _refFilterVersion = $('#refFilterVersion');
            _refFilterCube = $('#refFilterCube');
            _refFilterMethod = $('#refFilterMethod');
            _isRefAxisUpdate = $('#isRefAxisUpdate');
            _hasRefFilterUpdate = $('#hasRefFilterUpdate');
            _updateAxisName = $('#updateAxisName');
            _updateAxisTypeName = $('#updateAxisTypeName');
            _updateAxisValueTypeName = $('#updateAxisValueTypeName');
            _updateAxisSortOrder = $('#updateAxisSortOrder');
            _refAxisGroupUpdate = $('#refAxisGroupUpdate');
            _refAxisBranchUpdate = $('#refAxisBranchUpdate');
            _refAxisStatusUpdate = $('#refAxisStatusUpdate');
            _refAxisAppUpdate = $('#refAxisAppUpdate');
            _refAxisVersionUpdate = $('#refAxisVersionUpdate');
            _refAxisCubeUpdate = $('#refAxisCubeUpdate');
            _refAxisAxisUpdate = $('#refAxisAxisUpdate');
            _refFilterGroupUpdate = $('#refFilterGroupUpdate');
            _refFilterBranchUpdate = $('#refFilterBranchUpdate');
            _refFilterStatusUpdate = $('#refFilterStatusUpdate');
            _refFilterAppUpdate = $('#refFilterAppUpdate');
            _refFilterVersionUpdate = $('#refFilterVersionUpdate');
            _refFilterCubeUpdate = $('#refFilterCubeUpdate');
            _refFilterMethodUpdate = $('#refFilterMethodUpdate');
            _topAxisBtn = $('#topAxisBtn');
            _filterModal = $('#filterModal');
            _filterTable = $('#filterTable');

            addAxisEditListeners();
            addColumnEditListeners();
            addColumnHideListeners();
            addEditCellListeners();
            addFilterListeners();
            addSearchListeners();
            addModalFilters();
            modalsDraggable(true);

            _editCellRadioURL.change(function() {
                var isUrl = _editCellRadioURL.find('input').is(':checked');
                _urlDropdown.toggle(isUrl);
                _valueDropdown.toggle(!isUrl);
            });

            _urlDropdown.change(function() {
                enabledDisableCheckBoxes();
            });

            _valueDropdown.change(function() {
                enabledDisableCheckBoxes();
            });
            $('#addAxisOk').click(function () {
                addAxisOk();
            });
            $('#deleteAxisOk').click(function () {
                deleteAxisOk();
            });
            $('#updateAxisMenu').click(function () {
                updateAxis();
            });
            $('#updateAxisOk').click(function () {
                updateAxisOk();
            });
            _editCellModal.on('shown.bs.modal', function () {
                $('#editCellValue').focus();
            });

            $(document).keydown(function(e) {
                var isModalDisplayed = $('body').hasClass('modal-open');
                var focus = $(':focus');

                if (!isModalDisplayed && focus && ['cube-search','cube-search-content','search-field'].indexOf(focus.attr('id')) < 0)
                {
                    if (e.metaKey || e.ctrlKey)
                    {
                        // Control Key (command in the case of Mac)
                        if (e.keyCode === KEY_CODES.F) {
                            e.preventDefault();
                            _searchField.focus();
                        }
                        else if (e.keyCode == KEY_CODES.X) {
                            if (CLIP_NCE == _clipFormat) {
                                editCutCopy(true);  // true = isCut
                            } else {
                                excelCutCopy(true);
                            }
                        }
                        else if (e.keyCode == KEY_CODES.C)
                        {
                            if (CLIP_NCE == _clipFormat) {
                                editCutCopy(false); // false = copy
                            } else {
                                excelCutCopy(false);
                            }
                        } else if (e.keyCode == KEY_CODES.K) {
                            toggleClipFormat(e);
                        } else if (e.keyCode == KEY_CODES.V) {
                            // Ctrl-V
                            // Point focus to hidden text area so that it will receive the pasted content
                            editPaste();
                        }
                    }
                }
            });

            $(window).resize(function () {
                delay(function() {
                    var winWidth = $(this).width();
                    if (hot) {
                        hot.updateSettings({
                            height: $(this).height() - $('#hot-container').offset().top,
                            width: winWidth
                        });
                    }

                    NCubeEditor2.render();
                    setUtilityBarDisplay();
                },PROGRESS_DELAY);
            });
        }

        setCoordinateBarListeners();
        buildCubeMap();
        setUtilityBarDisplay();
    };

    var getNumFrozenCols = function() {
        var savedNum = nce.getNumFrozenCols();
        if (savedNum !== null) {
            return parseInt(savedNum);
        }
        return colOffset || 1;
    };

    var saveNumFrozenCols = function(num) {
        nce.saveNumFrozenCols(num);
    };

    var toggleClipFormat = function(event) {
        if (event) {
            event.preventDefault();
        }
        _clipFormat = CLIP_NCE === _clipFormat ? CLIP_EXCEL : CLIP_NCE;
        render();
    };

    var setUtilityBarDisplay = function() {
        var moveRightBtn = $('#coordinate-bar-move-right');
        var btnWidth = moveRightBtn.outerWidth();

        var windowWidth = $(this).width();
        var search = $('#search-container');
        var searchWidth = search.width();
        var coordWidth = windowWidth - searchWidth;
        $(getDomCoordinateBar()).width(coordWidth - btnWidth * 2); // coord bar text
        moveRightBtn.css({left: coordWidth - btnWidth}); // keep the right button to the end
        $('#util-container-bar').width(coordWidth); // coord bar container for background
        search.css({left: windowWidth - searchWidth});
    };

    var buildCubeMap = function() {
        // Step 1: Build giant cube list names string for pattern matching
        var s = "";
        prefixes = ['rpm.class.', 'rpm.enum.', ''];
        cubeMap = nce.getCubeMap();

        $.each(cubeMap, function (key)
        {
            if (key.length > 2)
            {   // 1. Only support n-cube names with 3 or more characters in them (too many false replaces will occur otherwise)
                // 2. Chop off accepted prefixes.
                for (var i=0; i < prefixes.length; i++)
                {
                    if (key.indexOf(prefixes[i]) == 0)
                    {
                        key = key.replace(prefixes[i], '');
                        break;
                    }
                }
                // 3. Reverse the cube list order (comes from server alphabetically case-insensitively sorted) to match
                // longer strings before shorter strings.
                // 4. Replace '.' with '\.' so that they are only matched against dots (period), not any character.
                s = escapeRegExp(key) + '|' + s;
            }
        });

        if (s.length > 0) {
            s = s.substring(0, s.length - 1);
        }
        s = '\\b(' + s + ')\\b';
        cubeMapRegex = new RegExp(s, 'gi');
    };

    var showHtmlError = function(text) {
        _ncubeContent.hide();
        _ncubeHtmlError.show();
        _ncubeHtmlError[0].innerHTML = text;
    };

    var clearHtmlError = function() {
        _ncubeContent.show();
        _ncubeHtmlError.hide();
    };

    var load = function() {
        resetCoordinateBar();
        if (hot) {
            hot.destroy();
            hot = null;
        }

        var result = nce.call("ncubeController.getJson", [nce.getSelectedTabAppId(), nce.getSelectedCubeName(), {mode:'json-index'}], {noResolveRefs:true});
        if (result.status === false) {
            showHtmlError('Failed to load JSON for cube, error: ' + result.data);
            return;
        }

        clearHtmlError();

        handleCubeData(JSON.parse(result.data));
        hot = new Handsontable(document.getElementById('hot-container'), getHotSettings());
        selectSavedOrDefaultCell();
        hot.render();
        setClipFormatToggleListener();
    };

    var setSearchHelperText = function() {
        var el = document.getElementById('search-info');
        var len = _searchCoords.length;
        var idx = _currentSearchResultIndex + 1;
        el.innerHTML = len > 0 ? idx + ' of ' + len : '';
    };

    var addSearchListeners = function() {
        $(_searchField).keyup(function (e) {
            delay(function() {
                var query = _searchField.value;
                if (query && query.length > 0) {
                    searchCubeData(query);
                    setSearchHelperText();
                    render();
                    if (e.keyCode === KEY_CODES.ENTER) {
                        _searchField.blur();
                        var result = _searchCoords[0];
                        hot.selectCell(result.row, result.col);
                    }
                } else {
                    clearSearchMatches();
                    setSearchHelperText();
                    render();
                }
            }, 500);
        });

        $('#search-btn-down').click(function() {
            var searchResultsLen = _searchCoords.length;
            if (_currentSearchResultIndex < searchResultsLen - 1 || searchResultsLen === 1) {
                var idx = searchResultsLen > 1 ? ++_currentSearchResultIndex : 0;
                var result = _searchCoords[idx];
                hot.selectCell(result.row, result.col);
                setSearchHelperText();
            }
            $(this).blur();
        });

        $('#search-btn-up').click(function() {
            if (_searchCoords.length > 0) {
                var idx = _currentSearchResultIndex > 0 ? --_currentSearchResultIndex : 0;
                var result = _searchCoords[idx];
                hot.selectCell(result.row, result.col);
                setSearchHelperText();
            }
            $(this).blur();
        });

        $('#search-btn-remove').click(function() {
            _searchField.value = '';
            clearSearchMatches();
            setSearchHelperText();
            render();
            $(this).blur();
        });

        $('#search-info').click(function() {
            _searchField.focus();
        });
    };

    var clearSearchMatches = function() {
        for (var axisNum = 0, axisLen = axes.length; axisNum < axisLen; axisNum++) {
            var axis = axes[axisNum];
            var cols = axis.columns;
            var colKeys = Object.keys(cols);
            for (var colNum = 0, colLen = colKeys.length; colNum < colLen; colNum++) {
                cols[colKeys[colNum]].isSearchResult = false;
            }
        }

        var cells = data.cells;
        var cellKeys = Object.keys(cells);
        for (var i = 0, len = cellKeys.length; i < len; i++) {
            cells[cellKeys[i]].isSearchResult = false;
        }

        _searchCoords = [];
        _currentSearchResultIndex = 0;
    };

    var searchCubeData = function(query) {
        _searchCoords = [];
        _currentSearchResultIndex = 0;

        var queryLower = query.toLowerCase();
        var containsQuery = function(value) {
            if (!value)
            {
                return false;
            }
            return value.toString().toLowerCase().indexOf(queryLower) > -1;
        };

        var multiplier = 1;
        var rowSpacing = numRows - 2;
        var axisNum, colNum, axisLen, colLen;
        var rowSpacingHelper = [];

        var isHorizAxis = function(axisNum) {
            return axisLen > 1 && axisNum === colOffset;
        };

        var getColumnTableCoords = function() {
            if (isHorizAxis(axisNum)) {
                _searchCoords.push({row: 1, col: colOffset + colNum});
            } else {
                var rowIdx = colNum * rowSpacing;
                for (var m = 0; m < multiplier; m++) {
                    _searchCoords.push({row: rowIdx + 2, col: axisNum});
                    rowIdx += rowSpacing * colLen;
                }
            }
        };

        // search all axes
        for (axisNum = 0, axisLen = axes.length; axisNum < axisLen; axisNum++) {
            var axis = axes[axisNum];
            var cols = axis.columns;
            var colKeys = Object.keys(cols);
            colLen = colKeys.length;
            rowSpacing /= colLen;

            var id = colKeys[0];
            var axisOrder = id.substring(0, id.length - 12);
            rowSpacingHelper.push({axisName:axis.name, order:axisOrder, rowSpacing:rowSpacing, horizAxis:isHorizAxis(axisNum)});

            // search all columns for an axis
            for (colNum = 0; colNum < colLen; colNum++)
            {
                var col = cols[colKeys[colNum]];
                col.isSearchResult = false;
                if (col.hasOwnProperty('name') && containsQuery(col.name))
                {
                    col.isSearchResult = true;
                    getColumnTableCoords();
                    continue;
                }
                if (col.hasOwnProperty('url') && containsQuery(col.url))
                {
                    col.isSearchResult = true;
                    getColumnTableCoords();
                    continue;
                }

                if (col.hasOwnProperty('value'))
                {
                    var val = col.value;
                    if (typeof val === 'object')
                    {
                        for (var i = 0, iLen = val.length; i < iLen; i++)
                        {
                            var curVal = val[i];
                            if (typeof curVal === 'object')
                            {
                                for (var j = 0, jLen = curVal.length; j < jLen; j++)
                                {
                                    if (containsQuery(curVal[j]))
                                    {
                                        col.isSearchResult = true;
                                        break;
                                    }
                                }
                                if (col.isSearchResult)
                                {
                                    getColumnTableCoords();
                                    break;
                                }
                            }
                            else if (containsQuery(curVal))
                            {
                                col.isSearchResult = true;
                                getColumnTableCoords();
                                break;
                            }
                        }
                    }
                    else
                    {
                        if (containsQuery(val)) {
                            col.isSearchResult = true;
                            getColumnTableCoords();
                        }
                    }
                }
            }
            multiplier *= colLen;
        }
        rowSpacingHelper.sort(function(a, b) {
            return a.order - b.order;
        });

        // search cells
        var cells = data.cells;
        var cellKeys = Object.keys(cells);
        for (var cellNum = 0, len = cellKeys.length; cellNum < len; cellNum++)
        {
            var cellId = cellKeys[cellNum];
            var cell = cells[cellId];
            var cellVal = cell.hasOwnProperty('url') ? cell.url : cell.value;
            var found = containsQuery(cellVal);
            cell.isSearchResult = found;

            if (found) {
                var colIds = cellId.split('_');
                var r = 0;
                var c = 0;
                for (var colIdNum = 0, colIdLen = colIds.length; colIdNum < colIdLen; colIdNum++) {
                    var curColId = colIds[colIdNum];
                    var curHelperObj = rowSpacingHelper[colIdNum];
                    var curColNum = axisColumnMap[curHelperObj.axisName].indexOf(curColId);

                    if (curHelperObj.horizAxis) {
                        c = curColNum;
                    } else {
                        r += curColNum * curHelperObj.rowSpacing;
                    }
                }

                _searchCoords.push({row: r + 2, col: c + (colOffset || 1)});
            }
        }

        _searchCoords.sort(function(a, b) {
            var rowA = a.row;
            var rowB = b.row;
            if (rowA === rowB) {
                var colA = a.col;
                var colB = b.col;
                return colA - colB;
            } else {
                return rowA - rowB;
            }
        });
    };

    var colorAxisButtons = function ()
    {
        var button = $('button.axis-btn').filter(function()
        {
            var buttonAxisName = $(this)[0].textContent.toLowerCase();
            return _hiddenColumns.hasOwnProperty(buttonAxisName);
        });
        button.removeClass('btn-primary');
        button.addClass('btn-warning');
    };

    var getColumnLength = function(axis) {
        if (axis.hasOwnProperty('columnLength')) {
            return axis.columnLength;
        }

        var colLen = Object.keys(axis.columns).length;
        if (axis.hasDefault) {
            colLen++;
        }
        axis.columnLength = colLen;
        return colLen;
    };

    var getAxisColumn = function(axis, colNum) {
        if (axis.columnLength === 0) {
            return;
        }

        var key = axisColumnMap[axis.name][colNum];
        var obj = axis.columns[key];
        obj.id = key;

        return obj;
    };

    var getColumnHeader = function(col) {
        var colHeader = getAxisColumn(axes[colOffset], col - colOffset);
        return colHeader ? colHeader : {id:'', value:''};
    };

    var getColumnHeaderValue = function(col) {
        return getRowHeaderValue(axes[colOffset], getColumnHeader(col));
    };

    var getColumnHeaderId = function(col) {
        return getColumnHeader(col).id;
    };

    var getAxisDefault = function(axis) {
        var defaultId = Object.keys(data.axes).indexOf(axis.name.toLowerCase()) + 1 + AXIS_DEFAULT;
        return {id:defaultId, value:DEFAULT_TEXT};
    };

    var getRowHeader = function(row, col) {
        var result;
        var rowNum = row - 2;
        if (rowNum < 0 || col < 0 || col > axes.length) {
            return;
        }

        var axis = axes[col];
        if (getAppliedFilters().length === 0) {
            var colLen = getColumnLength(axis);
            var repeatRowCount = (numRows - 2) / colLen;

            for (var axisNum = 0; axisNum < col; axisNum++) {
                var tempAxis = axes[axisNum];
                var colCount = getColumnLength(tempAxis);
                repeatRowCount /= colCount;
            }
            var columnNumberToGet = Math.floor(rowNum / repeatRowCount) % colLen;
            result = getAxisColumn(axis, columnNumberToGet);
        } else {
            var ids = _columnIdCombinationsToShow[rowNum].split('_');
            for (var idx = 0, idLen = ids.length; idx < idLen; idx++) {
                var curId = ids[idx];
                var column = axis.columns[curId];
                if (column !== undefined) {
                    result = column;
                    result.id = curId;
                    break;
                }
            }
        }

        return result;
    };

    var getRowHeaderValue = function(axis, rowHeader) {
        var getDateRangeString = function(range) {
            var v1 = range[0].substring(0, range[0].indexOf('T'));
            var v2 = range[1].substring(0, range[1].indexOf('T'));
            return '[' + v1 + ' - ' + v2 + ')';
        };

        var rule = '';
        var val = '';

        var type = axis.type.toLowerCase();
        var valueType = axis.valueType.toLowerCase();

        if (type === 'rule' && rowHeader.name !== undefined) {
            rule = '<span class="rule-name">' + rowHeader.name + '</span><hr class="hr-rule"/>';
        }

        val = rowHeader.value;
        if (valueType === 'date' && val !== DEFAULT_TEXT) {
            if (typeof val === 'object') {
                if (typeof val[0] === 'object') {
                    var temp = '';
                    for (var i = 0, len = val.length; i < len; i++) {
                        temp += getDateRangeString(val[i]) + ', ';
                    }
                    val = temp.slice(0, temp.lastIndexOf(', '));
                } else {
                    val = getDateRangeString(val);
                }
            } else {
                val = val.substring(0, val.indexOf('T'));
            }
        }
        if (val === undefined) {
            val = '<a class="nc-anc">' + rowHeader.url + '</a>';
        }
        if (rule !== '') {
            val = rule + '<span class="code">' + val + '</span>';
        }
        return '' + val;
    };

    var getRowHeaderPlainTextForWidth = function(axis, rowHeader) {
        var regexAnyTag = /(<([^>]+)>)/ig;
        var regexHr = /(<hr([^>]+)>)/ig;
        var val = getRowHeaderValue(axis, rowHeader);
        return val.replace(regexHr, '\n').replace(regexAnyTag, '');
    };

    var getRowHeaderPlainText = function(row, col) {
        var regexAnyTag = /(<([^>]+)>)/ig;
        var regexHr = /(<hr([^>]+)>)/ig;
        var val = getRowHeaderValue(axes[col], getRowHeader(row, col));
        return val.replace(regexHr, ' - ').replace(regexAnyTag, '');
    };

    var getRowHeaderId = function(row, col) {
        return getRowHeader(row, col).id;
    };

    var getCellId = function(row, col) {
        var cellId = '';
        var headerInfo = [];
        var i;

        if (axes.length > 1) {
            for (i = 0; i < colOffset; i++) {
                headerInfo.push(getRowHeaderId(row, i));
            }
            headerInfo.push(getColumnHeaderId(col));

            headerInfo.sort(function(a, b) {
                return a - b;
            });

            for (i = 0, len = headerInfo.length; i < len; i++) {
                cellId += headerInfo[i] + '_';
            }
            cellId = cellId.slice(0, -1);
        } else {
            cellId = getRowHeaderId(row, 0);
        }

        return cellId;
    };

    var getCellData = function(row, col) {
        return data.cells[getCellId(row, col)];
    };

    var hasCustomAxisOrder = function() {
        return localStorage.hasOwnProperty(getStorageKey(AXIS_ORDER));
    };

    var getAppliedFilters = function() {
        var appliedFilters = [];
        for (var i = 0, len = _filters.length; i < len; i++) {
            var curFilter = _filters[i];
            if (curFilter.isApplied) {
                appliedFilters.push(curFilter);
            }
        }

        return appliedFilters;
    };

    var getCellsByColumnId = function(colId) {
        var allCells = data.cells;
        var cellKeys = Object.keys(allCells);
        var columnCells = {};
        for (var i = 0, len = cellKeys.length; i < len; i++) {
            var key = cellKeys[i];
            if (key.indexOf(colId) > -1) {
                var cell = allCells[key];
                columnCells[key] = cell;
            }
        }

        return columnCells;
    };

    var doesCellMatchFilterExpression = function(cell, filter) {
        if (!filter.isIncludeAll && cell === undefined) {
            return false;
        }
        var cellVal = getTextCellValue(cell);
        var expVal = filter.expressionValue;
        switch (filter.comparator) {
            case '=':
                return cellVal === expVal;
            case '!=':
                return cellVal !== expVal;
            case '>':
                if (isNaN(cellVal) || isNaN(expVal)) {
                    return cellVal > expVal;
                }
                return parseInt(cellVal) > parseInt(expVal);
            case '<':
                if (isNaN(cellVal) || isNaN(expVal)) {
                    return cellVal < expVal;
                }
                return parseInt(cellVal) < parseInt(expVal);
            case 'contains':
                return cellVal.toLowerCase().indexOf(expVal.toLowerCase()) > -1;
            case 'excludes':
                return cellVal.toLowerCase().indexOf(expVal.toLowerCase()) === -1;
        }
        return false;
    };

    var getFirstFilteredCellsFromData = function() {
        var combos = [];
        var colIdReplaceIdx;
        var filter = getAppliedFilters()[0];
        if (filter.isIncludeAll) {
            var dAxes = data.axes;
            var dKeys = Object.keys(dAxes);
            for (var a = 0, aLen = dKeys.length; a < aLen; a++) {
                var axis = dAxes[dKeys[a]];
                if (axis.columns[filter.column]) {
                    colIdReplaceIdx = combos.length === 0 ? 0 : combos[0].length;
                } else {
                    var tempCombos = [];
                    var columns = axis.columns;
                    var colKeys = Object.keys(columns);
                    for (var colIdx = 0, colLen = colKeys.length; colIdx < colLen; colIdx++) {
                        var colId = colKeys[colIdx];
                        var comboLen = combos.length;
                        if (comboLen === 0) {
                            tempCombos.push(colId);
                        } else {
                            for (var comboIdx = 0; comboIdx < comboLen; comboIdx++) {
                                tempCombos.push(combos[comboIdx] + '_' + colId);
                            }
                        }
                    }
                    combos = tempCombos;
                }
            }
        } else {
            var colCells = getCellsByColumnId(filter.column);
            var colCellKeys = Object.keys(colCells);
            for (var c = 0, cLen = colCellKeys.length; c < cLen; c++) {
                var colCellKey = colCellKeys[c];
                var colCell = colCells[colCellKey];
                if (doesCellMatchFilterExpression(colCell, filter)) {
                    colIdReplaceIdx = colCellKey.indexOf(filter.column);
                    var axisColId = colCellKey.replace(filter.column,'').replace('__','');
                    if (axisColId.indexOf('_') === 0) {
                        axisColId = axisColId.substring(1);
                    } else if (axisColId.substring(axisColId.length - 1) === '_') {
                        axisColId = axisColId.substring(0, axisColId.length - 1);
                    }
                    combos.push(axisColId);
                }
            }
        }

        return {idCombinations:combos, idReplaceIdx:colIdReplaceIdx};
    };

    var handleCubeData = function(cubeData) {

        var determineAxesOrder = function (cubeAxes) {
            axes = [];
            var i, len, axis;
            if (hasCustomAxisOrder())
            {
                var order = JSON.parse(localStorage[getStorageKey(AXIS_ORDER)]);
                for (i = 0, len = order.length; i < len; i++)
                {
                    axis = cubeAxes[order[i]];
                    getColumnLength(axis);
                    axes.push(axis);
                }
            }
            else
            {
                var keys = Object.keys(cubeAxes);
                for (i = 0, len = keys.length; i < len; i++) {
                    axes.push(cubeAxes[keys[i]]);
                }

                var horizontal;
                axes.sort(function (a, b) {
                    return getColumnLength(b) - getColumnLength(a);
                });

                var delta;
                var smallestDelta = Number.MAX_VALUE;
                for (i = 0, len = axes.length; i < len; i++) {
                    axis = axes[i];
                    if (headerAxisNames.indexOf(axis.name) > -1) {
                        horizontal = i;
                        break;
                    }
                    delta = Math.abs(getColumnLength(axis) - 12);
                    if (delta < smallestDelta) {
                        smallestDelta = delta;
                        horizontal = i;
                    }
                }
                horizontal = axes.splice(horizontal, 1);
                axes.push(horizontal[0]);
            }
        };

        var setUpDataTable = function() {
            cubeName = cubeData.ncube;
            var totalRows = 1;
            colOffset = axes.length - 1;
            _filters = getSavedFilters();
            var appliedFilters = getAppliedFilters();

            if (axes.length > 1) {
                var horizAxis = axes[colOffset];

                numColumns = colOffset;

                var colLen = getColumnLength(horizAxis);
                if (colLen === 0) {
                    numColumns++;
                }

                numColumns += colLen;

                if (appliedFilters.length === 0) {
                    for (var axisNum = 0; axisNum < colOffset; axisNum++) {
                        totalRows *= getColumnLength(axes[axisNum]);
                    }
                    numRows = totalRows + 2;
                } else {
                    var resultFromFirstFilter = getFirstFilteredCellsFromData();
                    var colIdReplaceIdx = resultFromFirstFilter.idReplaceIdx;
                    _columnIdCombinationsToShow = resultFromFirstFilter.idCombinations;

                    for (var f = appliedFilters[0].isIncludeAll ? 0 : 1, fLen = appliedFilters.length; f < fLen; f++) {
                        var filter = appliedFilters[f];
                        var addIn = colIdReplaceIdx === 0 ? filter.column + '_' : '_' + filter.column;

                        for (var comboIdx = 0, comboLen = _columnIdCombinationsToShow.length; comboIdx < comboLen; comboIdx++) {
                            var combo = _columnIdCombinationsToShow[comboIdx];
                            var cellId = [combo.slice(0, colIdReplaceIdx), addIn, combo.slice(colIdReplaceIdx)].join('');
                            var cell = data.cells[cellId];
                            if (!doesCellMatchFilterExpression(cell, filter)) {
                                _columnIdCombinationsToShow.splice(comboIdx, 1);
                                comboIdx--;
                                comboLen--;
                            }
                        }
                    }
                    numRows = _columnIdCombinationsToShow.length + 2;
                }
            }
            else
            {
                var axis = axes[0];
                numColumns = 2;
                numRows = getColumnLength(axis) + 2;
            }
        };

        var setUpAxisColumnMap = function() {
            axisColumnMap = {};
            for (var axisNum = 0, axisLen = axes.length; axisNum < axisLen; axisNum++) {
                var axis = axes[axisNum];
                var axisName = axis.name;
                axisColumnMap[axisName] = [];
                var colArray = axisColumnMap[axisName];
                var colKeys = Object.keys(axis.columns);
                for (var colNum = 0, colLen = colKeys.length; colNum < colLen; colNum++) {
                    colArray.push(colKeys[colNum]);
                }

                if (axis.hasDefault) {
                    var defaultColumn = getAxisDefault(axis);
                    var defId = defaultColumn.id;
                    colArray.push(defId);
                    axis.columns[defId] = defaultColumn;
                }
            }
        };

        var hideColumns = function()
        {
            _hiddenColumns = {};
            var storageKey = getStorageKey(HIDDEN_COLUMNS);
            if (localStorage.hasOwnProperty(storageKey))
            {
                _hiddenColumns = JSON.parse(localStorage[storageKey]);
            }
            for (var i = 0, axisLength=axes.length; i < axisLength; i++)
            {
                var axis = axes[i];
                var lowerAxisName = axis.name.toLowerCase();
                if (_hiddenColumns.hasOwnProperty(lowerAxisName))
                {
                    var hiddenAxis = _hiddenColumns[lowerAxisName];
                    var keys = Object.keys(hiddenAxis);
                    for (var j = 0, len = keys.length; j < len; j++)
                    {
                        axis.columnLength--;
                        var columnId = keys[j];
                        delete axis.columns[columnId];
                    }
                }
            }
        };

        _searchCoords = [];
        _currentSearchResultIndex = 0;
        _searchField.value = '';
        setSearchHelperText();
        _defaultCellText = null;

        data = cubeData;
        determineAxesOrder(data.axes);
        hideColumns();
        setUpDataTable();
        setUpAxisColumnMap();
        setUpColumnWidths();
    };

    var buildTopAxisMenu = function() {
        if (axes.length < 2) {
            _topAxisBtn.empty();
        } else {
            buildAxisMenu(axes[colOffset], _topAxisBtn);
            var frozen = getNumFrozenCols();
            var idx = colOffset > frozen ? colOffset : frozen;
            idx += 2;
            var tr = $('#hot-container > div.ht_clone_top.handsontable > div > div > div > table > tbody > tr:nth-child(1) > td:nth-child(' + idx + ')');
            var offset = tr.offset();
            _topAxisBtn.css({top: offset.top + 1, left: offset.left + 1});
        }
    };

    var setUpColumnWidths = function()
    {
        var calcDomWidth = function (value, modifier, type)
        {
            if (textWidths.hasOwnProperty(value)) {
                return textWidths[value] + modifier;
            }
            var font = CODE_CELL_TYPE_LIST.indexOf(type) > -1 ? FONT_CODE : FONT_CELL;
            var width = 0;
            var idx = value.indexOf('\n');
            if (idx < 0) {
                width = $('<p>' + value + '</p>').canvasMeasureWidth(font);
            } else {
                var getNewWidth = function(str) {
                    var tempWidth = $('<p>' + str + '</p>').canvasMeasureWidth(font);
                    if (tempWidth > width) {
                        width = tempWidth;
                    }
                };
                var temp2;
                var temp1 = value;
                while (idx > -1) {
                    temp2 = value.substring(0, idx);
                    getNewWidth(temp2);
                    temp1 = temp1.substring(idx + 1);
                    idx = temp1.indexOf('\n');
                }
                getNewWidth(temp1);
            }

            textWidths[value] = width;
            return width + modifier;
        };

        var findWidth = function(oldWidth, newWidth)
        {
            if (oldWidth == undefined) oldWidth = 0;
            if (newWidth == undefined) newWidth = 0;
            if (oldWidth > MAX_COL_WIDTH || newWidth > MAX_COL_WIDTH)
            {
                return MAX_COL_WIDTH
            }
            else
            {
                return Math.max(MIN_COL_WIDTH, oldWidth, newWidth);
            }
        };

        var setupTopWidths = function()
        {
            var savedWidths = getSavedColumnWidths();
            var axis = axes[colOffset];
            var axisName = axis.name;
            var columns = axis.columns;
            var columnKeys = axisColumnMap[axisName];
            var width;
            if (savedWidths.hasOwnProperty(0 + colOffset)) {
                width = savedWidths[0 + colOffset];
            } else {
                var modifier = axis.isRef ? CALC_WIDTH_REF_AX_BUTTON_MOD : CALC_WIDTH_AXIS_BUTTON_MOD;
                var buttonWidth = calcDomWidth(axisName, modifier, null);
                width = findWidth(0, buttonWidth);
            }
            topWidths[columnKeys[0]] = width;

            for (var colIndex = 0, colLength = columnKeys.length; colIndex < colLength; colIndex++)
            {
                var colKey = columnKeys[colIndex];
                if (savedWidths.hasOwnProperty(colIndex + colOffset)) {
                    width = savedWidths[colIndex + colOffset];
                } else {
                    var column = columns[colKey];
                    var columnText = getRowHeaderPlainTextForWidth(axis, column);
                    var firstWidth = calcDomWidth(columnText, CALC_WIDTH_BASE_MOD, column.type);
                    width = findWidth(topWidths[colKey], firstWidth);
                }
                topWidths[colKey] = width;
            }

            if (columnKeys.length == 0)
            {
                _columnWidths.push(MIN_COL_WIDTH);
            }
            else
            {
                var firstColId = columnKeys[0];
                var colPrefix = firstColId.slice(0,-10);
                var regex = new RegExp(colPrefix + "(?:\\d{10})");
                var cells = data.cells;
                var cellKeys = Object.keys(cells);
                var topKeys = Object.keys(topWidths);
                for (var keyIndex = 0, len = cellKeys.length; keyIndex < len; keyIndex++) {
                    var cellKey = cellKeys[keyIndex];
                    var colId = regex.exec(cellKey)[0];
                    var hotColIdx = topKeys.indexOf(colId) + colOffset;
                    if (savedWidths.hasOwnProperty(hotColIdx)) {
                        width = savedWidths[hotColIdx];
                    } else {
                        var cell = cells[cellKey];
                        var value = getTextCellValue(cell);
                        width = calcDomWidth(value, CALC_WIDTH_BASE_MOD, cell.type);
                        width = findWidth(topWidths[colId], width);
                    }

                    topWidths[colId] = width;
                }
            }
        };

        var buildWidthArray = function()
        {
            var savedWidths = getSavedColumnWidths();
            for (var hotCol = 0, hotColLength = getHotSettings().startCols; hotCol < hotColLength; hotCol++)
            {
                if (hotCol < colOffset)
                {
                    var width;
                    if (savedWidths.hasOwnProperty(hotCol)) {
                        width = savedWidths[hotCol];
                    } else {
                        width = findWidestColumn(axes[hotCol]);
                    }
                    _columnWidths.push(width);
                }
                else
                {
                    var columnHeaderId = getColumnHeaderId(hotCol);
                    _columnWidths.push(topWidths[columnHeaderId]);
                }
            }
        };

        var buildSingleAxisWidthArray = function()
        {
            var savedWidths = getSavedColumnWidths();

            // header width
            if (savedWidths.hasOwnProperty(0)) {
                _columnWidths.push(savedWidths[0]);
            } else {
                _columnWidths.push(findWidestColumn(axes[0]));
            }

            // cell width
            if (savedWidths.hasOwnProperty(1)) {
                _columnWidths.push(savedWidths[1]);
            } else {
                var correctWidth;
                var oldWidth = 0;
                var cells = data.cells;
                var cellKeys = Object.keys(cells);
                for (var keyIndex = 0, len = cellKeys.length; keyIndex < len; keyIndex++) {
                    var cellKey = cellKeys[keyIndex];
                    var cell = cells[cellKey];
                    var value = getTextCellValue(cell);
                    var width = calcDomWidth(value, CALC_WIDTH_BASE_MOD, cell.type);
                    correctWidth = findWidth(oldWidth, width);
                    oldWidth = correctWidth;
                }
                _columnWidths.push(correctWidth);
            }
        };

        var findWidestColumn = function (axis)
        {
            var axisName = axis.name;
            var modifier = axis.isRef ? CALC_WIDTH_REF_AX_BUTTON_MOD : CALC_WIDTH_AXIS_BUTTON_MOD;
            var buttonWidth = calcDomWidth(axisName, modifier, null);
            var oldWidth = findWidth(0, buttonWidth);
            var correctWidth = oldWidth;
            var axisColumns = axisColumnMap[axisName];
            for (var axisCol = 0, axisColLength = axisColumns.length; axisCol < axisColLength; axisCol++)
            {
                var columnId = axisColumns[axisCol];
                var column = axis.columns[columnId];
                var columnText = getRowHeaderPlainTextForWidth(axis, column);
                var colWidth = calcDomWidth(columnText, CALC_WIDTH_BASE_MOD, column.type);
                correctWidth = findWidth(oldWidth, colWidth);
                oldWidth = correctWidth;
            }
            return correctWidth;
        };

        _columnWidths = [];
        var topWidths = {};
        var textWidths = {};
        if (axes.length == 1)
        {
            buildSingleAxisWidthArray();
        }
        else
        {
            setupTopWidths();
            buildWidthArray();
        }
        textWidths = null; // free up memory
    };

    var deleteSavedColumnWidths = function() {
        delete localStorage[getStorageKey(COLUMN_WIDTHS)];
    };

    var getSavedColumnWidths = function() {
        var localWidthVar = localStorage[getStorageKey(COLUMN_WIDTHS)];
        if (localWidthVar) {
            return JSON.parse(localWidthVar);
        }
        return {};
    };

    var saveColumnWidth = function(col, newVal) {
        var saved = getSavedColumnWidths();
        saved[col] = newVal;
        localStorage[getStorageKey(COLUMN_WIDTHS)] = JSON.stringify(saved);
    };

    var calcColumnHeader = function(index)
    {
        if (axes.length == 1)
        {
            if (index == 0)
            {
                return '';
            }
            return 'A';
        }

        if (index < colOffset)
        {
            return '';
        }
        var dividend = (index + 1) - colOffset;
        var modulo;
        var colName = '';

        while (dividend > 0) {
            modulo = (dividend - 1) % 26;
            colName = String.fromCharCode(65 + modulo) + colName;
            dividend = Math.floor((dividend - modulo) / 26);
        }

        return colName;
    };

    var calcRowHeader = function(index)
    {
        if (index < 1)
        {
            return '';
        }
        var text = _clipFormat === CLIP_NCE ? NBSP + 'NCE' + NBSP : 'Excel';
        if (index === 1) {
            return '<span class="glyphicon glyphicon-copy" style="font-size:13px"></span>' + NBSP + text;
        }
        return index - 1;
    };

    var setFrozenColumns = function(numFixed) {
        saveNumFrozenCols(numFixed);
        hot.updateSettings({fixedColumnsLeft:numFixed});
    };

    var getHotSettings = function() {
        return {
            copyPaste: false,
            fillHandle: false,
            colWidths: _columnWidths,
            rowHeights: [33,33],
            autoRowSize: false,
            enterBeginsEditing: false,
            enterMoves: {row: 1, col: 0},
            tabMoves : {row: 0, col: 1},
            colHeaders: calcColumnHeader,
            rowHeaders: calcRowHeader,
            startCols: numColumns,
            startRows: numRows,
            maxCols: numColumns,
            maxRows: numRows,
            contextMenu: false,
            manualColumnResize: true,
            manualRowResize: true,
            fixedColumnsLeft: getNumFrozenCols(),
            fixedRowsTop: 2,
            currentRowClassName: CLASS_HANDSON_CURRENT_ROW,
            currentColClassName: CLASS_HANDSON_CURRENT_ROW,
            outsideClickDeselects: false,
            height: function() {
                return $(window).height() - $("#hot-container").offset().top;
            },
            width: function() {
                return $(window).width();
            },
            cells: function (row, col, prop) {
                return {renderer:categoryRenderer};
            },
            beforeRender: function() {
                _firstRenderedCol = null;
            },
            afterRender: function() {
                buildTopAxisMenu();
                moveTopAxisMenu();
                setButtonDropdownLocations();
                colorAxisButtons();
            },
            afterColumnResize: function(currentColumn, newSize, isDoubleClick) {
                saveColumnWidth(currentColumn, newSize);
            },
            afterSelection: function(r, c, r2, c2) {
                var display = '';
                var axisName, axisVal;
                if (c >= colOffset) {
                    if (r === 1) {
                        display = '<strong>Axis</strong>: ' + axes[colOffset].name + ', <strong>Column</strong>:' + getColumnHeaderValue(c);
                    } else if (r > 1) {
                        display = '&nbsp;';
                        for (var axisNum = 0; axisNum < colOffset; axisNum++) {
                            axisName = axes[axisNum].name;
                            axisVal = getRowHeaderPlainText(r, axisNum);
                            display += '<strong>' + axisName + '</strong>: ' + axisVal + ', ';
                        }
                        if (axes.length > 1) {
                            var axis = axes[colOffset];
                            axisName = axis.name;
                            axisVal = getRowHeaderPlainTextForWidth(axis, getColumnHeader(c));
                        } else {
                            axisName = axes[0].name;
                            axisVal = getRowHeaderPlainText(r, 0);
                        }
                        display += '<strong>' + axisName + '</strong>: ' + axisVal;
                    }
                }
                else if (r > 1) {
                    display = '<strong>Axis</strong>: ' + axes[c].name + ', <strong>Column</strong>:' + getRowHeaderPlainText(r, c);
                }

                resetCoordinateBar(display);
                nce.saveViewPosition({row:r, col: c});
            },
            afterScrollHorizontally: function() {
                moveTopAxisMenu();
            }
        };
    };

    var moveTopAxisMenu = function() {
        var numFixed = getNumFrozenCols();
        var tr = $('#hot-container > div.ht_clone_top.handsontable > div > div > div > table > tbody > tr:nth-child(1)');
        var scrollAmt = $('.ht_master .wtHolder').scrollLeft();
        var thWidth = tr.find('th').outerWidth();
        var frozenWidth = thWidth;
        var startingWidth = thWidth;

        if (_firstRenderedCol === 0) {
            for (var i = 0; i < colOffset; i++) {
                var curWidth = tr.find('td').eq(i).outerWidth();
                startingWidth += curWidth;
                if (i < numFixed) {
                    frozenWidth += curWidth;
                }
            }
        }

        var newWidth;
        if (scrollAmt < (startingWidth - frozenWidth)) {
            newWidth = startingWidth - scrollAmt;
        } else {
            var afterSubtract = frozenWidth || (startingWidth - scrollAmt);
            newWidth = afterSubtract < thWidth ? thWidth : afterSubtract;
        }
        _topAxisBtn.css({left:newWidth});
    };

    var setClipFormatToggleListener = function() {
        $('#hot-container > div.ht_clone_top_left_corner.handsontable > div > div > div > table > tbody > tr:nth-child(2) > th').click(function(e) {
            toggleClipFormat(e);
        });
    };

    var setButtonDropdownLocations = function() {
        $('.dropdown-toggle').click(function () {
            var button = $(this);
            var offset = button.offset();
            var dropDownTop = offset.top + button.outerHeight();
            var dropDownLeft = offset.left;

            var modal = button.closest('.modal-content');
            if (modal[0]) {
                var modalOffset = modal.offset();
                dropDownTop -= modalOffset.top;
                dropDownLeft -= modalOffset.left;
            }

            button.parent().find('ul').css({top: dropDownTop + 'px', left: dropDownLeft + 'px'});
        });
    };

    var categoryRenderer = function(instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        td.className = '';
        if (_firstRenderedCol === null) {
            _firstRenderedCol = col;
        }

        // cube name
        if (row === 0 && (col < colOffset || col === 0)) {
            if (col === 0) {
                td.innerHTML = cubeName;
            }
            td.className += CLASS_HANDSON_CELL_CUBE_NAME;
            td.style.background = BACKGROUND_CUBE_NAME;
            td.style.color = COLOR_WHITE;
            td.colSpan = 1;
            cellProperties.readOnly = true;
            if (col < axes.length - 2) {
                td.style.borderRight = NONE;
                td.style.overflow = 'visible';
            }
        }

        // horizontal axis metadata area
        else if (row === 0) {
            if (axes.length > 1 && (col === colOffset || (_firstRenderedCol > 0 && col === _firstRenderedCol))) {
                td.style.overflow = 'visible';
                td.colSpan = axes[colOffset].columnLength - _firstRenderedCol;
            }
            td.style.background = BACKGROUND_AXIS_INFO;
            td.style.color = COLOR_WHITE;
            cellProperties.readOnly = true;
        }

        // vertical axes metadata area
        else if (row === 1 && (col < colOffset || col === 0)) {
            td.style.background = BACKGROUND_AXIS_INFO;
            td.style.color = COLOR_WHITE;
            td.style.overflow = 'visible';
            cellProperties.readOnly = true;
            buildAxisMenu(axes[col], td);
        }

        // column headers
        else if (row === 1) {
            if (axes.length > 1) {
                var column = getColumnHeader(col);
                td.innerHTML = getRowHeaderValue(axes[colOffset], column);
                if (column.isSearchResult) {
                    td.className += CLASS_HANDSON_SEARCH_RESULT;
                }
            }
            td.className += CLASS_HANDSON_TABLE_HEADER;
            cellProperties.editor = ColumnEditor;
        }

        // row headaers
        else if (col === 0 || col < colOffset) {
            var rowHeader = getRowHeader(row, col);
            var axis = axes[col];
            if (row > 2 && getColumnLength(axis) > 1  && col < colOffset - 1 && rowHeader.id === getRowHeader(row - 1, col).id) {
                td.style.borderTop = NONE;
            } else {
                td.innerHTML = getRowHeaderValue(axis, rowHeader);
            }
            td.className += CLASS_HANDSON_TABLE_HEADER;
            if (getRowHeader(row, col).isSearchResult) {
                td.className += CLASS_HANDSON_SEARCH_RESULT;
            }

            cellProperties.editor = ColumnEditor;
            if (axis.isRef) {
                cellProperties.readOnly = true;
            }
        }

        // otherwise in cell data
        else {
            var cellData = getCellData(row, col);
            td.className += CLASS_HANDSON_CELL_BASIC;
            if (cellData) {
                if (cellData.isSearchResult) {
                    td.className += CLASS_HANDSON_SEARCH_RESULT;
                }

                if (cellData.url !== undefined) {
                    td.className += CLASS_HANDSON_CELL_URL;
                    td.innerHTML = '<a class="nc-anc">' + cellData.url + '</a>';
                    buildUrlLink(td);
                } else if (cellData.value !== undefined && CODE_CELL_TYPE_LIST.indexOf(cellData.type) > -1) {
                    td.className += CLASS_HANDSON_CELL_CODE;
                    td.innerHTML = buildExpressionLink('' + cellData.value, 'groovy');
                    activateLinks(td);
                } else if ('date' === cellData.type) {
                    var val = cellData.value;
                    td.innerHTML = val.substring(0, val.indexOf('T'));
                } else {
                    td.innerHTML = buildExpressionLink('' + cellData.value);
                    activateLinks(td);
                }
            } else if (data.defaultCellValue !== null && data.defaultCellValue !== undefined) {
                td.className += CLASS_HANDSON_CELL_DEFAULT;
                if (_defaultCellText === null) {
                    _defaultCellText = buildExpressionLink('' + data.defaultCellValue, NONE);
                }
                td.innerHTML = _defaultCellText;
                activateLinks(td);
            }

            if (row % 2 !== 0) {
                td.className += CLASS_HANDSON_CELL_ODD_ROW;
            }

            cellProperties.editor = CellEditor;
        }
    };

    var getTableTextCellValue = function(row, col) {
        return getTextCellValue(getCellData(row, col));
    };

    var getTextCellValue = function(cellData)
    {
        var val = '';

        if (cellData)
        {
            if (cellData.url !== undefined)
            {
                val = cellData.url;
            }
            else if ('date' === cellData.type)
            {
                val = cellData.value;
                val = val.substring(0, val.indexOf('T'));
            }
            else
            {
                val = cellData.value;
            }
        }
        else if (data.defaultCellValue !== null && data.defaultCellValue !== undefined) {
            val = data.defaultCellValue;
        }
        return '' + val;
    };

    var buildUrlLink = function(element) {
        // Add click handler that opens clicked cube names
        $(element).find('a').each(function () {
            var anchor = $(this);
            anchor.click(function(event)
            {
                nce.clearError();
                var link = anchor[0].innerHTML;
                if (link.indexOf('http:') == 0 || link.indexOf('https:') == 0 || link.indexOf('file:') == 0)
                {
                    window.open(link);
                }
                else
                {
                    var result = nce.call("ncubeController.resolveRelativeUrl", [nce.getSelectedTabAppId(), link], {noResolveRefs:true});
                    if (result.status === true && result.data)
                    {
                        link = result.data;
                        window.open(link);
                    }
                    else
                    {
                        var msg = result.data ? result.data : "Unable to resolve relative URL against entries in sys.classpath";
                        nce.showNote('Unable to open ' + link + ':<hr class="hr-small"/>' + msg);
                    }
                }
                event.preventDefault();
            });
        });
    };

    var buildExpressionLink = function(url, highlightLanguage) {
        if (url && url.length > 2) {
            var found = false;
            var val;
            var shouldHighlight = highlightLanguage !== NONE;

            url = url.replace(cubeMapRegex, function (matched) {
                found = true;
                return '<a class="nc-anc">' + matched + '</a>';
            });
            val = url;

            if (found) {
                if (shouldHighlight) {
                    //highlight in between links
                    var highlighted = '';
                    var tempHighlight;
                    var top;
                    var ancIdx;
                    while ((ancIdx = url.indexOf('<a class="nc-anc">')) > -1) {
                        var text = url.substring(0, ancIdx);
                        var endIdx = url.indexOf('</a>') + 4;
                        tempHighlight = highlightLanguage ? hljs.highlight(highlightLanguage, text, true, top) : hljs.highlightAuto(text);
                        if (highlightLanguage) {
                            top = hljs.highlight(highlightLanguage, url.substring(0, endIdx), true, top).top;
                        }
                        highlighted += tempHighlight.value;
                        highlighted += url.substring(ancIdx, endIdx);
                        url = url.substring(endIdx);
                    }
                    tempHighlight = highlightLanguage ? hljs.highlight(highlightLanguage, url, true, top) : hljs.highlightAuto(url);
                    highlighted += tempHighlight.value;
                    val = highlighted;
                }
            } else {
                if (shouldHighlight) {
                    var highlighted = highlightLanguage ? hljs.highlight(highlightLanguage, url, true) : hljs.highlightAuto(url);
                    val = highlighted.value;
                }
            }
        } else {
            val = url;
        }
        return val;
    };

    var activateLinks = function(element) {
        // Add click handler that opens clicked cube names
        $(element).find('a').each(function () {
            var link = this;
            $(link).click(function (e) {
                var cubeName = link.textContent.toLowerCase();
                for (var i = 0, len = prefixes.length; i < len; i++) {
                    var fullName = prefixes[i] + cubeName;
                    if (cubeMap[fullName]) {
                        nce.selectCubeByName(nce.getProperCubeName(fullName));
                        break;
                    }
                }
            });
        });
    };

    var buildAxisMenu = function(axis, element) {
        var axisName = axis.name;
        var isRef = axis.isRef;
        var axisIndex = findIndexOfAxisName(axisName);

        var div = $('<div/>').prop({class: 'btn-group axis-menu'});
        var button = $('<button/>').prop({type:'button', class:'btn-sm btn-primary dropdown-toggle axis-btn'})
            .attr('data-toggle', 'dropdown');
        var name = $('<span/>').innerHTML = isRef ? axisName + NBSP + '<span class="glyphicon glyphicon-share-alt"></span>' : axisName;
        var caret = $('<span/>').prop({class: 'caret'});
        button.append(name);
        button.append(caret);
        div.append(button);

        var ul = $('<ul/>').prop({class: 'dropdown-menu', role: 'menu'});
        var li;
        var an;

        if (isRef) {
            li = $('<li/>');
            an = $('<a href="#">');
            an[0].innerHTML = "Go to axis source";
            an.click(function (e) {
                e.preventDefault();
                var appId = appIdFrom(axis.referenceApp, axis.referenceVersion, axis.referenceStatus, axis.referenceBranch);
                nce.selectCubeFromAppId(appId, axis.referenceCubeName);
            });
            li.append(an);
            ul.append(li);
            li = $('<li/>');
            an = $('<a href="#">');
            an[0].innerHTML = "Break reference";
            an.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                li.find('li').not($(this).parent()).find('button').remove();
                var buttons = $(this).find('button');
                if (buttons.length === 0) {
                    $(this).append(
                        $('<button/>')
                            .addClass('btn btn-danger btn-xs pull-right axis-menu-button')
                            .html('Cancel')
                    ).append(
                        $('<button/>')
                            .addClass('btn btn-primary btn-xs pull-right axis-menu-button')
                            .html('Confirm')
                            .click(function (e) {
                                li.parent().parent().removeClass('open');
                                li.find('button').remove();
                                $('div.dropdown-backdrop').hide();
                                var result = nce.call("ncubeController.breakAxisReference", [nce.getSelectedTabAppId(), nce.getSelectedCubeName(), axisName]);
                                if (result.status) {
                                    reload();
                                } else {
                                    nce.showNote('Error breaking reference for axis ' + axisName + ':<hr class="hr-small"/>' + result.data);
                                }
                            })
                    );
                } else {
                    buttons.remove();
                }
            });
            li.append(an);
            ul.append(li);
            li = $('<div/>').prop({'class': 'divider'});
            ul.append(li);
        }

        li = $('<li/>');
        an = $('<a href="#">');
        an[0].innerHTML = "Update Axis...";
        an.click(function (e) {
            e.preventDefault();
            updateAxis(axisName)
        });
        li.append(an);
        ul.append(li);
        li = $('<li/>');
        an = $('<a href="#">');
        an[0].innerHTML = "Add Axis...";
        an.click(function (e) {
            e.preventDefault();
            addAxis();
        });
        li.append(an);
        ul.append(li);
        li = $('<li/>');
        an = $('<a href="#">');
        an[0].innerHTML = "Delete Axis...";
        an.click(function (e) {
            e.preventDefault();
            deleteAxis(axisName)
        });
        li.append(an);
        ul.append(li);
        li = $('<div/>').prop({'class': 'divider'});
        ul.append(li);
        li = $('<li/>');
        an = $('<a href="#">');
        an[0].innerHTML = "Edit columns...";
        if (isRef) {
            li.prop('class', 'disabled');
            an.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
            });
        } else {
            an.click(function (e) {
                e.preventDefault();
                editColumns(axisName)
            });
        }
        li.append(an);
        ul.append(li);

        if (axisIndex === colOffset) {
            li = $('<div/>').prop({'class': 'divider'});
            ul.append(li);
            li = $('<li/>');
            an = $('<a href="#">');
            an[0].innerHTML = "Filter Data...";
            an.click(function (e) {
                e.preventDefault();
                filterOpen();
            });
            li.append(an);
            ul.append(li);

            li = $('<li/>');
            an = $('<a href="#">');
            an[0].innerHTML = "Clear Filters";
            if (_filters.length > 0) {
                an.click(function (e) {
                    e.preventDefault();
                    clearFilters();
                    destroyEditor();
                    reload();
                });
            }
            else {
                li.prop('class','disabled');
                an.click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
            li.append(an);
            ul.append(li);
        }

        li = $('<div/>').prop({'class': 'divider'});
        ul.append(li);
        li = $('<li/>');
        an = $('<a href="#">');
        an[0].innerHTML = "Hide columns...";
        an.click(function (e) {
            e.preventDefault();
            hideColumns(axisName)
        });
        li.append(an);
        ul.append(li);

        var lowerAxisName = axisName.toLowerCase();
        li = $('<li/>');
        an = $('<a href="#">');
        an[0].innerHTML = "Show all columns";
        if (_hiddenColumns.hasOwnProperty(lowerAxisName))
        {
            an.click(function (e)
            {
                e.preventDefault();
                delete _hiddenColumns[lowerAxisName];
                storeHiddenColumns();
                destroyEditor();
                reload();
            });
        }
        else
        {
            li.prop({'class': 'disabled'});
            an.click(function (e)
            {
                e.preventDefault();
                e.stopPropagation();
            });
        }
        li.append(an);
        ul.append(li);

        li = $('<li/>');
        an = $('<a href="#">');
        an[0].innerHTML = "Revert column widths";
        if (localStorage[getStorageKey(COLUMN_WIDTHS)]) {
            an.click(function (e) {
                e.preventDefault();
                delete localStorage[getStorageKey(COLUMN_WIDTHS)]
                reload();
            });
        } else {
            li.prop({'class': 'disabled'});
            an.click(function (e)
            {
                e.preventDefault();
                e.stopPropagation();
            });
        }
        li.append(an);
        ul.append(li);

        li = $('<div/>').prop({'class': 'divider'});
        ul.append(li);
        li = $('<li/>');
        an = $('<a href="#">');
        an[0].innerHTML = "# Frozen Columns:";
        an.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
        });
        var newNameInput = $('<input/>')
            .attr('type','text')
            .addClass('form-control frozen-cols-input')
            .val(getNumFrozenCols())
            .click(function (ie) {
                ie.preventDefault();
                ie.stopPropagation();
            })
            .keyup(function(e) {
                if ([KEY_CODES.ENTER,KEY_CODES.TAB].indexOf(e.keyCode) > -1) {
                    li.removeClass('open');
                    $('div.dropdown-backdrop').hide();
                }
            })
            .change(function() {
                var val = $(this).val();
                if (!isNaN(val)) {
                    setFrozenColumns(parseInt(val));
                }
            })
        ;
        an.append(newNameInput);
        li.append(an);
        ul.append(li);

        var axesLength = axes.length;
        if (axisIndex !== colOffset)
        {
            li = $('<div/>').prop({'class': 'divider'});
            ul.append(li);
            li = $('<li/>').prop({'class': 'dropdown-header'});
            li[0].innerHTML = "Move Axis";
            ul.append(li);
            li = $('<li/>');
            var btnGroup = $('<div/>').prop({'class': 'btn-group btn-group-sm indent-axis-buttons'}).attr({'role': 'group'});
            li.append(btnGroup);
            var btn, span;
            //Move Left
            btn = $('<button/>').prop({type:'button', class:'btn btn-default'}).attr({'aria-label': 'Move Left'});
            span = $('<span/>').prop({'class': 'glyphicon glyphicon-arrow-left'}).attr({'aria-hidden': 'true'});
            if (axisIndex == 0)
            {
                btn.prop({'disabled': 'disabled'});
                btn.click(function (e)
                {
                    e.preventDefault();
                });
            }
            else
            {
                btn.click(function (e) {
                    e.preventDefault();
                    moveAxis(axisIndex, axisIndex - 1)
                });
            }
            btn.append(span);
            btnGroup.append(btn);
            //Move Up
            btn = $('<button/>').prop({type:'button', class:'btn btn-default'}).attr({'aria-label': 'Move Up'});
            span = $('<span/>').prop({'class': 'glyphicon glyphicon-arrow-up'}).attr({'aria-hidden': 'true'});
            btn.append(span);
            btn.click(function (e) {
                e.preventDefault();
                clearFilters();
                moveAxis(axisIndex, colOffset)
            });
            btnGroup.append(btn);
            //Move Right
            btn = $('<button/>').prop({type:'button', class:'btn btn-default'}).attr({'aria-label': 'Move Right'});
            span = $('<span/>').prop({'class': 'glyphicon glyphicon-arrow-right'}).attr({'aria-hidden': 'true'});
            if (axisIndex == axesLength - 2)
            {
                btn.prop({'disabled': 'disabled'});
                btn.click(function (e)
                {
                    e.preventDefault();
                });
            }
            else
            {
                btn.click(function (e) {
                    e.preventDefault();
                    moveAxis(axisIndex, axisIndex + 1)
                });
            }
            btn.append(span);
            btnGroup.append(btn);
            ul.append(li);

            li = $('<li/>');
            an = $('<a href="#">');
            an[0].innerHTML = "Revert Axis Order";
            if (hasCustomAxisOrder()) {
                an.click(function (e) {
                    e.preventDefault();
                    delete localStorage[getStorageKey(AXIS_ORDER)];
                    destroyEditor();
                    reload();
                });
            } else {
                li.prop({'class': 'disabled'});
                an.click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
            li.append(an);
            ul.append(li);
        }

        $(div).append(ul);
        $(element).empty();
        $(element).append(div);
    };

    //====================================== coordinate bar functions ==================================================

    var getDomCoordinateBar = function() {
        return document.getElementById('coordinate-bar-text');
    };

    var getDomCoordinateBarLeftButton = function() {
        return document.getElementById('coordinate-bar-move-left');
    };

    var getDomCoordinateBarRightButton = function() {
        return document.getElementById('coordinate-bar-move-right');
    };

    var resetCoordinateBar = function(displayText) {
        var bar = getDomCoordinateBar();
        var left = getDomCoordinateBarLeftButton();
        var right = getDomCoordinateBarRightButton();

        bar.scrollLeft = 0;
        bar.innerHTML = displayText || '';

        if ($(bar).hasScrollBar()) {
            $(left).show();
            $(right).show();
        } else {
            $(left).hide();
            $(right).hide();
        }
    };

    var setCoordinateBarListeners = function() {
        var coordBar = getDomCoordinateBar();
        var leftButton = getDomCoordinateBarLeftButton();
        var rightButton = getDomCoordinateBarRightButton();

        $(leftButton).click(function() {
            coordBar.scrollLeft = coordBar.scrollLeft - COORDINATE_BAR_SCROLL_AMOUNT;
            $(this).blur();
        });

        $(rightButton).click(function() {
            coordBar.scrollLeft = coordBar.scrollLeft + COORDINATE_BAR_SCROLL_AMOUNT;
            $(this).blur();
        });
    };

    // ==================================== Begin Custom HOT Editors ===================================================

    var destroyEditor = function() {
        hot.getActiveEditor().finishEditing(null, null, null, true);
        var searchQuery = _searchField.value;
        if (searchQuery !== null && searchQuery.length > 0) {
            var curCell = getSelectedCellRange();
            var curRow = curCell.startRow;
            var curCol = curCell.startCol;
            var prevIdx = _currentSearchResultIndex;
            searchCubeData(searchQuery);
            _currentSearchResultIndex = prevIdx;

            for (var i = 0, len = _searchCoords.length; i < len; i++) {
                var curSearchCoord = _searchCoords[i];
                if (curRow === curSearchCoord.row && curCol === curSearchCoord.col) {
                    _currentSearchResultIndex = i;
                    break;
                }
            }

            setSearchHelperText();
            render();
        }
    };

    var onBeforeKeyDown = function(event) {
        event.isImmediatePropagationEnabled = false;
        event.cancelBubble = true;
    };

    var keepKeyDownText = function(e) {
        var keycode = e.keyCode;
        var valid =
            (keycode > 47 && keycode < 58)   || // number keys
            keycode == 32 || keycode == 13   || // spacebar & return key(s) (if you want to allow carriage returns)
            (keycode > 64 && keycode < 91)   || // letter keys
            (keycode > 95 && keycode < 112)  || // numpad keys
            (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
            (keycode > 218 && keycode < 223);   // [\]' (in order)

        if (valid) {
            var addChar = String.fromCharCode(keycode);
            _bufferText += e.shiftKey ? addChar : addChar.toLowerCase();
        }
    };

    var NcubeBaseEditor = Handsontable.editors.TextEditor.prototype.extend();
    NcubeBaseEditor.prototype.prepare = function(row, col, prop, td, cellProperties) {
        Handsontable.editors.BaseEditor.prototype.prepare.apply(this, arguments);
        _bufferText = '';
        this.instance.addHook('beforeKeyDown', keepKeyDownText);
    };
    NcubeBaseEditor.prototype.open = function() {
        this.instance.addHook('beforeKeyDown', onBeforeKeyDown);
    };
    NcubeBaseEditor.prototype.finishEditing = function(restoreOriginalValue, ctrlDown, callback, forceClose) {
        if (!this.isOpened()) {
            if (forceClose) {
                this.state = Handsontable.EditorState.EDITING; // needed to override finish editing
            }
            Handsontable.editors.BaseEditor.prototype.finishEditing.apply(this, arguments);
        }
    };
    NcubeBaseEditor.prototype.close = function() {
        this.instance.removeHook('beforeKeyDown', onBeforeKeyDown);
    };

    var CellEditor = NcubeBaseEditor.prototype.extend();
    CellEditor.prototype.open = function() {
        NcubeBaseEditor.prototype.open.apply(this, arguments);

        _tableCellId = getCellId(this.row, this.col);
        _cellId = _tableCellId.split('_');
        editCell();
    };
    CellEditor.prototype.isOpened = function() {
        return $(_editCellModal).hasClass('in');
    };

    var ColumnEditor = NcubeBaseEditor.prototype.extend();
    ColumnEditor.prototype.open = function() {
        NcubeBaseEditor.prototype.open.apply(this, arguments);

        var axis = this.row === 1 ? axes[colOffset] : axes[this.col];
        editColumns(axis.name);
    };
    ColumnEditor.prototype.isOpened = function() {
        return $(_editColumnModal).hasClass('in');
    };

    // ==================================== End Custom HOT Editors =====================================================

    // ==================================== Begin Copy / Paste =========================================================

    var getSelectedCellRange = function() {
        var cellRange = hot.getSelected(); // index of the currently selected cells as an array [startRow, startCol, endRow, endCol]
        if (!cellRange) {
            return null;
        }
        return {
            startRow: cellRange[0],
            startCol: cellRange[1],
            endRow: cellRange[2],
            endCol: cellRange[3]
        };
    };

    var excelCutCopy = function(isCut)
    {
        if (isCut && !nce.ensureModifiable('Cannot cut / copy cells.')) {
            return;
        }

        var clipData = '';
        var range = getSelectedCellRange();
        var cells = [];

        for (var row = range.startRow; row <= range.endRow; row++)
        {
            for (var col = range.startCol; col <= range.endCol; col++)
            {
                var content = getTableTextCellValue(row, col);
                var cellId = getCellId(row, col);
                if (cellId) {
                    cells.push(cellId.split('_'));
                }

                if (content.indexOf('\n') > -1) {
                    // Must quote if newline (and double any quotes inside)
                    clipData += '"' + content.replace(/"/g, '""') + '"';
                }
                else
                {
                    clipData += content;
                }

                if (col < range.endCol)
                {   // Only add tab on last - 1 (otherwise paste will overwrite data in next column)
                    clipData += '\t';
                }
            }
            cells.push(null);
            clipData += '\n';
        }
        cells.splice(cells.length - 1, 1);

        if (isCut) {
            var result = nce.call("ncubeController.copyCells", [nce.getSelectedTabAppId(), nce.getSelectedCubeName(), cells, true]);
            if (!result.status) {
                nce.showNote('Error copying/cutting cells:<hr class="hr-small"/>' + result.data);
                return;
            }
            reload();
        }

        _clipboard.val(clipData);
        _clipboard.focusin();
        _clipboard.select();
    };

    var editCutCopy = function(isCut) {
        if (isCut && !nce.ensureModifiable('Cannot cut / copy cells.')) {
            return;
        }

        var cells = [];
        var range = getSelectedCellRange();

        for (var row = range.startRow; row <= range.endRow; row++) {
            for (var col = range.startCol; col <= range.endCol; col++) {
                var cellId = getCellId(row, col);
                if (cellId) {
                    cells.push(cellId.split('_'));
                }
            }
            cells.push(null);
        }
        cells.splice(cells.length - 1, 1);

        // Get clipboard ready string + optionally clear cells from database
        var result = nce.call("ncubeController.copyCells", [nce.getSelectedTabAppId(), nce.getSelectedCubeName(), cells, isCut]);
        if (!result.status) {
            nce.showNote('Error copying/cutting cells:<hr class="hr-small"/>' + result.data);
            return;
        }
        if (isCut) {
            reload();
        }

        var clipData = result.data;
        _clipboard.val(CLIP_NCE + clipData);
        _clipboard.focusin();
        _clipboard.select();
    };

    var editPaste = function() {
        _clipboard.val('');
        _clipboard.focus();

        if (!nce.ensureModifiable('Cannot paste cells.')) {
            return;
        }

        var range = getSelectedCellRange();

        if (!range || range.length < 1) {
            return;
        }

        // Location of first selected cell in 2D spreadsheet view.
        var firstRow = range.startRow;
        var firstCol = range.startCol;

        // Location of the last selected cell in 2D spreadsheet view.
        var lastRow = range.endRow;
        var lastCol = range.endCol;

        var numTableRows = hot.countRows();
        var numTableCols = hot.countCols();

        var onlyOneCellSelected = firstRow == lastRow && firstCol == lastCol;

        setTimeout(function() {
            var content = _clipboard.val();
            if (!content || content == "") {
                return;
            }

            // Parse the clipboard content and build-up coordinates where this content will be pasted.
            var result;
            var colNum = firstCol;
            var rowNum = firstRow;

            if (content.indexOf(CLIP_NCE) == 0) {
                // NCE clipboard data (allows us to handle all cell types)
                content = content.slice(CLIP_NCE.length);
                var clipboard = JSON.parse(content);

                if (onlyOneCellSelected) {
                    // Paste full clipboard data to cube (if it fits, otherwise clip to edges)
                    for (var lineNum = 0, len = clipboard.length; lineNum < len; lineNum++) {
                        var cellInfo = clipboard[lineNum];
                        if (cellInfo == null) {
                            rowNum++;
                            colNum = firstCol;
                        } else {
                            if (colNum < numTableCols) {
                                // Do attempt to read past edge of 2D grid
                                var cellId = getCellId(rowNum, colNum);
                                cellInfo.push(cellId.split('_'));
                            }
                            colNum++;
                        }
                        if (rowNum >= numTableRows) {
                            // Do not go past bottom of grid
                            break;
                        }
                    }
                } else {
                    // Repeat / Clip case: multiple cells are selected when PASTE invoked, clip pasting to selected
                    // range. This is the 'fill-mode' of paste (repeating clipboard data to fill selected rectangle)
                    var clipRect = [[]];  // 2D array
                    var clipCol = 0;
                    var clipRow = 0;

                    // Refashion linear clipboard (with nulls as column boundaries) to 2D
                    for (var k = 0, len = clipboard.length; k < len; k++) {
                        if (clipboard[k]) {
                            clipRect[clipRow][clipCol] = clipboard[k];
                            clipCol++;
                        } else {
                            clipCol = 0;
                            clipRow++;
                            clipRect[clipRow] = [];
                        }
                    }
                    clipRow++;  // count of rows (not 0 based), e.g. 4 for rows 0-3 (needed for modulo below)

                    rowNum = firstRow;
                    var clipboard2 = [];

                    for (var r = firstRow; r <= lastRow; r++) {
                        for (var c = firstCol; c <= lastCol; c++) {
                            var info = clipRect[(r - firstRow) % clipRow][(c - firstCol) % clipCol];
                            var cloneCellInfo = info.slice(0);
                            var cellId = getCellId(r, c);
                            cloneCellInfo.push(cellId.split('_'));
                            clipboard2.push(cloneCellInfo);
                        }
                        rowNum++;
                    }
                    clipboard = clipboard2;
                }
                // Paste cells from database
                result = nce.call("ncubeController.pasteCellsNce", [nce.getSelectedTabAppId(), nce.getSelectedCubeName(), clipboard]);
            } else {
                // Normal clipboard data, from Excel, for example
                var lines = parseExcelClipboard(content);
                var coords = [];
                var rowCoords = [];
                var values = [];

                // If more than one cell is selected, create coords for all selected cells.
                // Server will repeat values, properly throughout the selected 'clip' region.
                for (var i = 0; i < lines.length; i++) {
                    rowCoords = [];
                    values.push(lines[i]);  // push a whole line of values at once.
                    colNum = firstCol;

                    for (var j = 0, len = lines[i].length; j < len; j++) {
                        if (colNum < numTableCols) {
                            // Do attempt to read past edge of 2D grid
                            var cellId = getCellId(rowNum, colNum);
                            rowCoords.push(cellId.split('_'));
                        }
                        colNum++;
                    }
                    coords.push(rowCoords);
                    rowNum++;

                    if (rowNum > numTableRows) {
                        // Do not go past bottom of grid
                        break;
                    }
                }

                if (!onlyOneCellSelected) {
                    // Multiple cells are selected when PASTE invoked, clip pasting to selected range.
                    coords = [];
                    var addHotIds = [];
                    for (r = firstRow; r <= lastRow; r++) {
                        rowCoords = [];
                        for (c = firstCol; c <= lastCol; c++) {
                            var cellId = getCellId(r, c);
                            rowCoords.push(cellId.split('_'));
                            addHotIds.push(cellId);
                        }
                        coords.push(rowCoords);
                    }
                }

                // Paste cells from database
                result = nce.call("ncubeController.pasteCells", [nce.getSelectedTabAppId(), nce.getSelectedCubeName(), values, coords]);
            }

            if (result.status) {
                reload();
            } else {
                nce.clearError();
                nce.showNote('Error pasting cells:<hr class="hr-small"/>' + result.data);
            }
        }, 100);
    };

    // ==================================== End Copy / Paste ===========================================================

    // ==================================== Everything to do with Cell Editing =========================================

    var addEditCellListeners = function() {
        $('#editCellClear').click(function() {
            editCellClear();
        });
        $('#editCellCancel').click(function() {
            editCellCancel();
        });
        $('#editCellOk').click(function() {
            editCellOK();
        });
        _editCellValue.keydown(function(e) {
            if (e.keyCode === KEY_CODES.TAB) {
                e.preventDefault();
                var start = this.selectionStart;
                var end = this.selectionEnd;

                // set textarea value to insert tab
                var oldVal = $(this).val();
                $(this).val(oldVal.substring(0, start) + '\t' + oldVal.substring(end));

                // put cursor to correct position
                this.selectionStart = this.selectionEnd = start + 1;
            }
        });
    };

    var editCell = function() {
        if (!nce.ensureModifiable('Cell cannot be updated.')) {
            return;
        }

        var result = nce.call("ncubeController.getCellNoExecute", [nce.getSelectedTabAppId(), nce.getSelectedCubeName(), _cellId]);

        if (result.status === false) {
            nce.showNote('Unable to fetch the cell contents: ' + result.data);
            return;
        }

        var cellInfo = result.data;
        // Set the cell value (String)
        var cellValue = cellInfo.value ? cellInfo.value : '';
        _editCellValue.val(cellValue);
        if (cellInfo.dataType == "null" || !cellInfo.dataType) {
            cellInfo.dataType = "string";
        }

        // Set the correct entry in the drop-down
        if (cellInfo.isUrl) {
            _urlDropdown.val(cellInfo.dataType);
        } else {
            _valueDropdown.val(cellInfo.dataType);
        }

        // Choose the correct data type drop-down (show/hide the other)
        _urlDropdown.toggle(cellInfo.isUrl);
        _valueDropdown.toggle(!cellInfo.isUrl);

        // Set the URL check box
        _editCellRadioURL.find('input').prop('checked', cellInfo.isUrl);

        // Set the Cache check box state
        _editCellCache.find('input').prop('checked', cellInfo.isCached);

        enabledDisableCheckBoxes(); // reset for form
        _editCellModal.modal('show');

        if (_bufferText.trim() !== '') {
            $(_editCellModal).one('shown.bs.modal', function () {
                _editCellValue.val(cellValue + _bufferText);
            });
        }
    };

    var editCellClear = function() {
        _editCellModal.modal('hide');
        var result = nce.call("ncubeController.updateCell", [nce.getSelectedTabAppId(), nce.getSelectedCubeName(), _cellId, null]);

        if (result.status === false) {
            _cellId = null;
            nce.showNote('Unable to clear cell:<hr class="hr-small"/>' + result.data);
            return;
        }

        delete data.cells[_tableCellId];
        _cellId = null;
        destroyEditor();
    };

    var editCellCancel = function() {
        _cellId = null;
        _editCellModal.modal('hide');
        destroyEditor();
    };

    var editCellOK = function() {
        var cellInfo = {'@type':'com.cedarsoftware.ncube.CellInfo'};
        cellInfo.isUrl = _editCellRadioURL.find('input').prop('checked');
        cellInfo.value = _editCellValue.val();
        cellInfo.dataType = cellInfo.isUrl ? _urlDropdown.val() : _valueDropdown.val();
        cellInfo.isCached = _editCellCache.find('input').prop('checked');
        _editCellModal.modal('hide');

        var result = nce.call("ncubeController.updateCell", [nce.getSelectedTabAppId(), nce.getSelectedCubeName(), _cellId, cellInfo]);

        if (result.status === false) {
            _cellId = null;
            nce.showNote('Unable to update cell:<hr class="hr-small"/>' + result.data);
            return;
        }

        data.cells[_tableCellId] = {value:cellInfo.value};
        _cellId = null;
        destroyEditor();
        reload();
    };

    var enabledDisableCheckBoxes = function() {
        var isUrl = _editCellRadioURL.find('input').is(':checked');
        var selDataType = isUrl ? _urlDropdown.val() : _valueDropdown.val();
        var urlEnabled = URL_ENABLED_LIST.indexOf(selDataType) > -1;
        var cacheEnabled = CACHE_ENABLED_LIST.indexOf(selDataType) > -1;

        // Enable / Disable [x] URL
        _editCellRadioURL.find('input').prop("disabled", !urlEnabled);

        if (urlEnabled) {
            _editCellRadioURL.removeClass('disabled');
        } else {
            _editCellRadioURL.addClass('disabled');
        }

        // Enable / Disable [x] Cache
        _editCellCache.find('input').prop("disabled", !cacheEnabled);

        if (cacheEnabled) {
            _editCellCache.removeClass('disabled');
        } else {
            _editCellCache.addClass('disabled');
        }
    };

    // =============================================== End Cell Editing ================================================

    // ============================================== Begin Filtering ==================================================

    var addFilterListeners = function() {
        $('#filterInstTitle')[0].textContent = 'Instructions - Filter Data';
        $('#filterInstructions')[0].innerHTML = 'Select filters to apply to cell data for ncube.';
        var tr = $('<tr/>');
        tr.append($('<td/>').html('Apply'));
        tr.append($('<td/>').html('Column'));
        tr.append($('<td/>').html('Comparator'));
        tr.append($('<td/>').html('Comparison Value'));
        tr.append($('<td/>').html('Include Empty Cells'));
        tr.append($('<td/>'));
        _filterTable.append(tr);

        $('#filterAdd').click(function() {
            addFilter();
        });
        $('#filterClear').click(function () {
            filterClear();
        });
        $('#filterCancel').click(function () {
            filterClose();
        });
        $('#filterSave').click(function () {
            filterSave();
        });
    };

    var addNewTableRow = function() {
        var tr = $('<tr/>').prop('class','filter-expression');
        var appliedCheckbox = $('<input/>').prop({type:'checkbox', class:'isApplied'});
        var includeAllCheckbox = $('<input/>').prop({type:'checkbox', class:'isIncludeAll'});
        var columnSelect = $('<select/>').prop('class','column');
        var expressionSelect = $('<select/>').prop('class','comparator');
        var expressionInput = $('<input/>').prop({type:'text', class:'expressionValue'});
        var closeBtn = $('<span/>').prop({class:'glyphicon glyphicon-remove tab-close-icon', 'aria-hidden':'true'});

        var columns = axes[colOffset].columns;
        var columnKeys = Object.keys(columns);
        for (var i = 0, len = columnKeys.length; i < len; i++) {
            var colId = columnKeys[i];
            var opt = $('<option/>');
            opt.val(colId);
            opt.text(columns[colId].value);
            columnSelect.append(opt);
        }

        for (var c = 0, cLen = FILTER_COMPARATOR_LIST.length; c < cLen; c++) {
            expressionSelect.append($('<option/>').text(FILTER_COMPARATOR_LIST[c]));
        }

        closeBtn.click(function() {
            tr.remove();
        });

        tr.append($('<td/>').append(appliedCheckbox));
        tr.append($('<td/>').append(columnSelect));
        tr.append($('<td/>').append(expressionSelect));
        tr.append($('<td/>').append(expressionInput));
        tr.append($('<td/>').append(includeAllCheckbox));
        tr.append($('<td/>').append(closeBtn));
        _filterTable.append(tr);

        return tr;
    };

    var addFilter = function() {
        var tr = addNewTableRow();
        tr.find('.isApplied').prop('checked','true');
        tr.find('.isIncludeAll').prop('checked','true');
    };

    var filterClear = function() {
        _filterTable.find('tr.filter-expression').remove();
    };

    var filterSave = function() {
        _filters = [];
        var trs = _filterTable.find('tr.filter-expression');
        for (var trIdx = 0, trLen = trs.length; trIdx < trLen; trIdx++) {
            var tr = $(trs[trIdx]);
            var filter = {};
            filter.isApplied = tr.find('.isApplied').prop('checked');
            filter.isIncludeAll = tr.find('.isIncludeAll').prop('checked');
            filter.column = tr.find('.column').val();
            filter.comparator = tr.find('.comparator').val();
            filter.expressionValue = tr.find('.expressionValue').val();
            _filters.push(filter);
        }

        saveFilters();
        filterClose();
        reload();
    };

    var filterClose = function() {
        $(_filterModal).modal('hide');
        hot.removeHook('beforeKeyDown', onBeforeKeyDown);
    };

    var filterOpen = function() {
        filterClear();
        for (var f = 0, fLen = _filters.length; f < fLen; f++) {
            var filter = _filters[f];
            var tr = addNewTableRow();
            tr.find('.isApplied').prop('checked',filter.isApplied);
            tr.find('.isIncludeAll').prop('checked',filter.isIncludeAll);
            tr.find('.column').val(filter.column);
            tr.find('.comparator').val(filter.comparator);
            tr.find('.expressionValue').val(filter.expressionValue);
        }

        hot.addHook('beforeKeyDown', onBeforeKeyDown);
        $(_filterModal).modal();
    };

    // =============================================== End Filtering ===================================================

    // ============================================== Column Editing== =================================================

    var addColumnEditListeners = function() {
        $('#editColSelectAll').click(function () {
            checkAll(true, '.editColCheckBox')
        });
        $('#editColSelectNone').click(function () {
            checkAll(false, '.editColCheckBox')
        });
        $('#editColAdd').click(function () {
            editColAdd()
        });
        $('#editColDelete').click(function () {
            editColDelete()
        });
        $('#editColUp').click(function () {
            editColUp()
        });
        $('#editColDown').click(function () {
            editColDown()
        });
        $('#editColumnsCancel').click(function () {
            editColCancel()
        });
        $('#editColumnsSave').click(function () {
            editColSave()
        });
    };

    var editColumns = function(axisName) {
        if (!nce.ensureModifiable('Columns cannot be edited.')) {
            return false;
        }

        var result = nce.call("ncubeController.getAxis", [nce.getSelectedTabAppId(), nce.getSelectedCubeName(), axisName]);
        var axis;
        if (result.status === true) {
            axis = result.data;
            if (!axis.columns) {
                axis.columns = [];
            }
            if (axis.defaultCol) {
                // Remove actual Default Column object (not needed, we can infer it from Axis.defaultCol field being not null)
                axis.columns.splice(axis.columns.length - 1, 1);
            }
        } else {
            nce.showNote("Could not retrieve axis: " + axisName + " for n-cube '" + nce.getSelectedCubeName() + "':<hr class=\"hr-small\"/>" + result.data);
            return;
        }
        sortColumns(axis);
        loadColumns(axis);
        var moveBtnAvail = axis.preferredOrder == 1;
        if (moveBtnAvail === true) {
            $('#editColUp').show();
            $('#editColDown').show();
        } else {
            $('#editColUp').hide();
            $('#editColDown').hide();
        }
        $('#editColumnsLabel')[0].innerHTML = 'Edit ' + axisName;
        hot.addHook('beforeKeyDown', onBeforeKeyDown);
        $(_editColumnModal).modal();
    };

    var sortColumns = function(axis) {
        if (axis.preferredOrder == 1) {
            axis.columns.sort(function(a, b) {
                return a.displayOrder - b.displayOrder;
            });
        }
    };

    var getUniqueId = function() {
        return _colIds--;
    };

    var editColAdd = function() {
        var input = $('.editColCheckBox');
        var loc = -1;
        $.each(input, function (index, btn) {
            if ($(this).prop('checked')) {
                loc = index;
            }
        });
        var axis = _columnList.prop('model');
        var newCol = {
            '@type': 'com.cedarsoftware.ncube.Column',
            'value': 'newValue',
            'id': getUniqueId()
        };

        if (loc == -1 || axis.preferredOrder == 0) {
            axis.columns.push(newCol);
            loc = input.length - 1;
        } else {
            axis.columns.splice(loc + 1, 0, newCol);
        }
        loadColumns(axis);

        // Select newly added column name, so user can just type over it.
        input = _columnList.find('.form-control');
        input[loc + 1].select();
    };

    var editColDelete = function() {
        var axis = _columnList.prop('model');
        var input = $('.editColCheckBox');
        var cols = axis.columns;
        var colsToDelete = [];
        $.each(input, function (index, btn) {
            if ($(this).prop('checked')) {
                colsToDelete.push(index);
            }
        });

        // Walk through in reverse order, deleting from back to front so that
        // the correct elements are deleted.
        for (var i=colsToDelete.length - 1; i >= 0; i--) {
            cols.splice(colsToDelete[i], 1);
        }
        loadColumns(axis);
    };

    var editColUp = function() {
        var axis = _columnList.prop('model');
        var cols = axis.columns;
        var input = $('.editColCheckBox');

        if (cols && cols.length > 0 && input[0].checked) {
            // Top one checked, cannot move any items up
            return;
        }

        for (var i=0; i < input.length - 1; i++) {
            var tag = input[i];
            cols[i].checked = tag.checked;
            if (!tag.checked) {
                var nextTag = input[i + 1];
                cols[i + 1].checked = nextTag.checked;
                if (nextTag.checked) {
                    tag.checked = true;
                    nextTag.checked = false;

                    var temp = cols[i];
                    cols[i] = cols[i + 1];
                    cols[i + 1] = temp;

                    cols[i].checked = true;
                    cols[i + 1].checked = false;
                }
            }
        }

        loadColumns(axis);
    };

    var editColDown = function() {
        var axis = _columnList.prop('model');
        var cols = axis.columns;
        var input = $('.editColCheckBox');

        if (cols && cols.length > 0 && input[cols.length - 1].checked) {
            // Bottom one checked, cannot move any items down
            return;
        }

        for (var i=input.length - 1; i > 0; i--) {
            var tag = input[i];
            cols[i].checked = tag.checked;
            if (!tag.checked) {
                var nextTag = input[i - 1];
                cols[i - 1].checked = nextTag.checked;
                if (nextTag.checked) {
                    tag.checked = true;
                    nextTag.checked = false;

                    var temp = cols[i];
                    cols[i] = cols[i - 1];
                    cols[i - 1] = temp;

                    cols[i].checked = true;
                    cols[i - 1].checked = false;
                }
            }
        }

        loadColumns(axis);
    };

    var editColCancel = function() {
        $(_editColumnModal).modal('hide');
        hot.removeHook('beforeKeyDown', onBeforeKeyDown);
        destroyEditor();
    };

    var editColSave = function() {
        var axis = _columnList.prop('model');
        _columnList.find('input[data-type=cond]').each(function(index, elem) {
            axis.columns[index].value = elem.value;
        });
        _columnList.find('input[data-type=name]').each(function(index, elem) {
            var col = axis.columns[index];
            if (col.metaProp) {
                col.metaProp.name = elem.value;
            }
        });
        axis.defaultCol = null;
        var result = nce.call("ncubeController.updateAxisColumns", [nce.getSelectedTabAppId(), nce.getSelectedCubeName(), axis.name, axis.columns]);

        if (result.status !== true) {
            nce.showNote("Unable to update columns for axis '" + axis.name + "':<hr class=\"hr-small\"/>" + result.data);
            return;
        }
        var lowerAxisName = axis.name.toLowerCase();
        if (_hiddenColumns.hasOwnProperty(lowerAxisName))
        {
            nce.showNote('Hidden column selections for axis ' + axis.name + ' removed.', 'Note', 2000);
            delete _hiddenColumns[lowerAxisName];
            storeHiddenColumns();
        }
        deleteSavedColumnWidths();
        $(_editColumnModal).modal('hide');
        hot.removeHook('beforeKeyDown', onBeforeKeyDown);
        destroyEditor();
        reload();
    };

    var loadColumns = function(axis) {
        var insTitle = $('#editColInstTitle');
        var inst = $('#editColInstructions');
        if ('DISCRETE' == axis.type.name) {
            insTitle[0].textContent = 'Instructions - Discrete Column';
            inst[0].innerHTML = "<i>Discrete</i> column has a single value per column. Values are matched with '='. \
            Strings are matched case-sensitively.  Look ups are indexed and run \
            in <a href=\"http://en.wikipedia.org/wiki/Time_complexity\" target=\"_blank\">O(log n)</a>. \
        <ul><li>Examples: \
        <ul> \
        <li>Enter string values as is, no quotes: <code>OH</code></li> \
        <li>Valid number: <code>42</code></li> \
        <li>Valid date: <code>2015/02/14</code> (or <code>14 Feb 2015</code>, <code>Feb 14, 2015</code>, <code>February 14th, 2015</code>, <code>2015-02-14</code>)</li> \
        <li>Do not use mm/dd/yyyy or dd/mm/yyyy. \
        </li></ul></li></ul>";
        }
        else if ('RANGE' == axis.type.name) {
            insTitle[0].textContent = 'Instructions - Range Column';
            inst[0].innerHTML = "A <i>Range</i> column contains a <i>low</i> and <i>high</i> value.  It matches when \
            <i>value</i> is within the range: value >= <i>low</i> and value < <i>high</i>. Look ups are indexed \
            and run in <a href=\"http://en.wikipedia.org/wiki/Time_complexity\" target=\"_blank\">O(log n)</a>.\
        <ul><li>Enter low value, high value. Treated [inclusive, exclusive).</li> \
        <li>Examples: \
        <ul> \
        <li><i>Number range</i>: <code>25, 75</code> (meaning x >= 25 AND x < 75)</li> \
        <li><i>Number range</i>: <code>[100, 1000]</code> (brackets optional)</li> \
        <li><i>Date range</i>: <code>2015/01/01, 2017-01-01</code> (date >= 2015-01-01 AND date < 2017-01-01) \
        </li></ul></li></ul>";
        }
        else if ('SET' == axis.type.name) {
            insTitle[0].textContent = 'Instructions - Set Column';
            inst[0].innerHTML = "A <i>Set</i> column can contain unlimited discrete values and ranges. Discrete values \
            match with '=' and ranges match when value is within the range [inclusive, exclusive).  Overlapping\
            ranges and values are <b>not</b> allowed.  If you need that capability, use a <i>Rule</i> axis.\
            Look ups are indexed and run in <a href=\"http://en.wikipedia.org/wiki/Time_complexity\" target=\"_blank\">O(log n)</a>.\
        <ul><li>Examples: \
        <ul> \
        <li><i>Numbers</i>: <code>6, 10, [20, 30], 45</code></li> \
        <li><i>Strings</i>: <code>\"TX\", \"OH\", \"GA\"</code></li> \
        <li><i>Dates</i>: <code>\"2016-01-01\"</code></li> \
        <li><i>Date range</i>: <code>[\"2010/01/01\", \"2012/12/31\"]</code></li> \
        <li><i>Date ranges</i>: <code>[\"2015-01-01\", \"2016-12-31\"], [\"2019/01/01\", \"2020/12/31\"]</code> \
        </li></ul></li></ul>";
        }
        else if ('NEAREST' == axis.type.name) {
            insTitle[0].textContent = 'Instructions - Nearest Column';
            inst[0].innerHTML = "A <i>Nearest</i> column has a single value per column.  The <i>closest</i> column on the \
            axis to the passed in value is matched.  Strings are compared similar to spell-check \
            (See <a href=\"http://en.wikipedia.org/wiki/Levenshtein_distance\" target=\"_blank\">Levenshtein</a> algorithm). \
            Lat/Lon's column values are compared using earth curvature in distance calculation \
            (See <a href=\"http://en.wikipedia.org/wiki/Haversine_formula\" target=\"_blank\">Haversine</a> forumla). \
            Numbers compared using abs(column - value).  Look ups scan all columns and run in \
            <a href=\"http://en.wikipedia.org/wiki/Time_complexity\" target=\"_blank\">O(n)</a>. \
        <ul><li>Examples: \
        <ul> \
        <li>With columns <code>Alpha, Bravo, Charlie</code>, <i>value</i> <code>alfa</code> will match column <code>Alpha</code>.  It has the closest 'edit' distance.</li> \
        <li>With columns <code>1, 10, 100, 1000</code>, <i>value</i> <code>400</code> will match column <code>100</code>. (Distance of 300 is smallest).</li> \
        <li>Dates are entered in the same formats in Discrete column instructions (many formats supported).</li> \
        <li>Do not use mm/dd/yyyy or dd/mm/yyyy for dates.</li></ul></li></ul>";
        }
        else if ('RULE' == axis.type.name) {
            insTitle[0].textContent = 'Instructions - Rule Column';
            inst[0].innerHTML = "A <i>Rule condition</i> column is entered as a rule name and condition.  All rule conditions \
            that evaluate to <i>true</i> have their associated statement cells executed.  By default all <i>true</i> \
            conditions will fire. (See our definition of <a href=\"http://groovy.codehaus.org/Groovy+Truth\" target=\"_blank\">true</a>). \
            The Rule axis can be set so that only the first <i>true</i> condition fires.  When running a rule-cube, \
            if the name of a rule is bound to the rule axis, execution will start on the named rule.  A rule axis can \
            have a <i>Default</i> column. Just like all other axis types, at least one condition on a rule axis must fire, \
            otherwise a CoordinateNotFound exception will be thrown.  Look ups scan all columns (except when fire once is indicated) \
            and run in <a href=\"http://en.wikipedia.org/wiki/Time_complexity\" target=\"_blank\">O(n)</a>. \
        <ul><li>Notes: \
        <ul> \
        <li>Enter the [optional] rule name in the top line (no quotes).</li> \
        <li>Enter <i>condition</i> in <a href=\"http://groovy.codehaus.org/\" target=\"_blank\">Groovy</a> on the second line.</li> \
        <li>The <i>input</i> and <i>output</i> Maps and <i>ncube</i> are available in the condition and statements (cells).</li> \
        <li><i>Example condition</i>: <code>input.state == 'OH'</code></li> \
        </ul></li></ul>";
        }
        else {
            insTitle[0].textContent = 'Instructions';
            inst[0].innerHTML = 'Unknown axis type';
        }

        var axisList = axis.columns;
        _columnList.empty();
        _columnList.prop('model', axis);
        var displayOrder = 0;
        $.each(axisList, function (key, item) {
            if (!item.displayOrder || item.displayOrder < 2147483647) {   // Don't add default column in
                item.displayOrder = displayOrder++;
                var rowDiv = $('<div/>').prop({class: "row", "model": item});
                var div = $('<div/>').prop({class: "input-group"});
                var span = $('<span/>').prop({class: "input-group-addon"});
                var inputBtn = $('<input/>').prop({class: "editColCheckBox", "type": "checkbox"});
                if (item.checked === true) {
                    inputBtn[0].checked = true;
                }

                // For rules with URL to conditions, support URL: (or url:) in front of URL - then store as URL
                if (axis.type.name == 'RULE') {
                    if (!item.metaProps) {
                        item.metaProps = {"name": "Condition " + displayOrder};
                    }
                    var inputName = $('<input/>').prop({class: "form-control", "type": "text"});
                    inputName.attr({"data-type": "name"});
                    inputName.blur(function () {
                        item.metaProps.name = inputName.val();
                    });
                    inputName.val(item.metaProps.name);
                }

                var inputText = $('<input/>').prop({class: "form-control", "type": "text"});
                inputText.attr({"data-type":"cond"});
                inputText.blur(function() {
                    item.value = inputText.val();
                });

                var prefix = '';
                if (item.isUrl) {
                    prefix += 'url|';
                }
                if (item.isCached) {
                    prefix += 'cache|';
                }

                inputText.val(prefix + item.value);
                span.append(inputBtn);
                div.append(span);
                if (axis.type.name == 'RULE') {
                    div.append(inputName);
                }
                div.append(inputText);
                rowDiv.append(div);
                _columnList.append(rowDiv);
            }
        });
    };

    // =============================================== End Column Editing ==============================================

    // =============================================== Begin Column Hiding ==========================================

    var addColumnHideListeners = function() {
        $('#hideColSelectAll').click(function ()
        {
            checkAll(true, '.commitCheck')
        });
        $('#hideColSelectNone').click(function ()
        {
            checkAll(false, '.commitCheck')
        });
        $('#hideColumnsCancel').click(function ()
        {
            hideColCancel()
        });
        $('#hideColumnsSave').click(function ()
        {
            hideColSave()
        });
    };

    var hideColumns = function(axisName)
    {
        var result = nce.call("ncubeController.getAxis", [nce.getSelectedTabAppId(), nce.getSelectedCubeName(), axisName]);
        var axis;
        if (result.status === true)
        {
            axis = result.data;
            if (!axis.columns)
            {
                axis.columns = [];
            }
            if (axis.defaultCol)
            {   // Remove actual Default Column object (not needed, we can infer it from Axis.defaultCol field being not null)
                axis.columns.splice(axis.columns.length - 1, 1);
            }
        }
        else
        {
            nce.showNote("Could not retrieve axis: " + axisName + " for n-cube '" + nce.getSelectedCubeName() + "':<hr class=\"hr-small\"/>" + result.data);
            return;
        }
        sortColumns(axis);
        loadHiddenColumns(axis);
        $('#hideColumnsLabel')[0].innerHTML = 'Hide ' + axisName + ' columns';
        hot.addHook('beforeKeyDown', onBeforeKeyDown);
        $('#hideColumnsModal').modal();
    };

    var loadHiddenColumns = function(axis)
    {
        var insTitle = $('#hideColInstTitle');
        var inst = $('#hideColInstructions');
        insTitle[0].textContent = 'Instructions - Hide Column';
        inst[0].innerHTML = "Select columns to show. Deselect columns to hide.";

        var axisList = axis.columns;
        var lowerAxisName = axis.name.toLowerCase();
        var defaultCol = axis.defaultCol;
        if (defaultCol !=null)
        {
            axisList.push(axis.defaultCol);
        }
        _hideColumnsList.empty();
        _hideColumnsList.prop('model', axis);
        var displayOrder = 0;
        $.each(axisList, function (key, item)
        {
            item.displayOrder = displayOrder++;
            var itemId = item.id;
            var listItem = $('<li/>').prop({class: "list-group-item skinny-lr no-margins"});
            var rowDiv = $('<div/>').prop({class: "container-fluid"});
            var rowLabel = $('<label/>').prop({class: "checkbox no-margins col-xs-10"});
            var ruleLabel = '';
            if (item.metaProps !=null)
            {
                ruleLabel = item.metaProps.name + ': ';
            }
            var labelText = item.value != null ? item.value : DEFAULT_TEXT;
            var label = ruleLabel + labelText;
            var inputBtn = $('<input/>').prop({class: "commitCheck", type: "checkbox"});
            inputBtn.attr("data-id", itemId);
            inputBtn[0].checked = !_hiddenColumns[lowerAxisName] || !_hiddenColumns[lowerAxisName][itemId];
            listItem.append(rowDiv);
            rowDiv.append(rowLabel);
            rowLabel.append(inputBtn);
            rowLabel.append(label);
            _hideColumnsList.append(listItem);
        });
    };

    var hideColCancel = function()
    {
        $('#hideColumnsModal').modal('hide');
        hot.removeHook('beforeKeyDown', onBeforeKeyDown);
    };

    var hideColSave = function()
    {
        var axis = _hideColumnsList.prop('model');
        var lowerAxisName = axis.name.toLowerCase();
        var columnIds = [];
        $('.commitCheck:not(:checked)').each(function () {
            var id = $(this).attr('data-id');
            columnIds.push(id);
        });
        if (columnIds.length == axis.columns.length)
        {
            nce.showNote('Please select at least one column to show.', 'Note', 2000);
            return;
        }
        delete _hiddenColumns[lowerAxisName];
        if (columnIds.length > 0)
        {
            _hiddenColumns[lowerAxisName] = {};
            for (var i = 0, len = columnIds.length; i < len; i++)
            {
                var columnId = columnIds[i];
                _hiddenColumns[lowerAxisName][columnId] = true;
            }
        }
        storeHiddenColumns();
        $('#hideColumnsModal').modal('hide');
        hot.removeHook('beforeKeyDown', onBeforeKeyDown);
        destroyEditor();
        reload();
    };

    var getStorageKey = function(prefix)
    {
        return prefix + ':' + nce.getSelectedTabAppId().app.toLowerCase() + ':' + data.ncube.toLowerCase();
    };

    var getSavedFilters = function() {
        var filters = localStorage[getStorageKey(FILTERS)];
        return filters ? JSON.parse(filters) : [];
    };

    var clearFilters = function() {
        _filters = [];
        saveFilters();
    };

    var saveFilters = function() {
        saveOrDeleteValue(_filters, getStorageKey(FILTERS));
    };

    var storeHiddenColumns = function() {
        saveOrDeleteValue(_hiddenColumns, getStorageKey(HIDDEN_COLUMNS));
    };

    var saveOrDeleteValue = function(obj, storageKey) {
        if (obj && Object.keys(obj).length > 0) {
            localStorage[storageKey] = JSON.stringify(obj);
        } else {
            delete localStorage[storageKey];
        }
    };

    // =============================================== End Column Hiding ===============================================

    // =============================================== Begin Axis Ordering =============================================

    var moveAxis = function (fromIndex, toIndex) {
        axes.splice(toIndex, 0, axes.splice(fromIndex, 1)[0]);
        storeAxisOrder();
        deleteSavedColumnWidths();
        destroyEditor();
        reload();
    };

    var findIndexOfAxisName = function (axisName) {
        for (var i = 0, len = axes.length; i < len; i++)
        {
            if (axes[i].name.toLowerCase() === axisName.toLowerCase())
            {
                return i;
            }
        }
        return -1;
    };

    var storeAxisOrder = function() {
        var order = [];
        for (var i = 0, len = axes.length; i < len; i++)
        {
            order.push(axes[i].name.toLowerCase());
        }
        localStorage[getStorageKey(AXIS_ORDER)] = JSON.stringify(order);
    };

    // =============================================== End Axis Ordering ===============================================

    // =============================================== Begin Axis Editing ==============================================

    var addAxisEditListeners = function() {
        var getAppsMethod = 'getAppNames';
        var getVersionsMethod = 'getAppVersions';
        var cubeSearchMethod = 'search';
        var searchAxis = 'axis';
        var searchMethod = 'method';
        var axisTypes = {};

        var populateSelect = function(sel, method, params, defVal, forceRefresh, isInverted) {
            if (forceRefresh || sel[0].options.length === 0) {
                sel.empty();
                var result = nce.call('ncubeController.' + method, params);
                if (result.status === true) {
                    var results = result.data;
                    for (var i = 0, len = results.length; i < len; i++) {
                        var option = $('<option/>');
                        var optionValue = results[i];
                        if (method === cubeSearchMethod) {
                            optionValue = optionValue.name;
                        }
                        option[0].innerHTML = optionValue;
                        if (isInverted) {
                            sel.prepend(option);
                        } else {
                            sel.append(option);
                        }
                    }
                } else {
                    nce.showNote('Error calling ' + method + '():<hr class="hr-small"/>' + result.data);
                }
            }
            if (defVal) {
                sel.val(defVal);
            } else {
                sel.prepend($('<option/>'));
            }
        };

        var populateSelectFromCube = function(sel, params, searchType, defVal, forceRefresh) {
            if (forceRefresh || sel[0].options.length === 0) {
                sel.empty();
                var result = nce.call('ncubeController.getJson', params, {noResolveRefs:true});
                if (result.status === true) {
                    var results = JSON.parse(result.data).axes;
                    if (searchType === searchMethod) {
                        for (var idx = 0, iLen = results.length; idx < iLen; idx++) {
                            var axis = results[idx];
                            if (['method','methods'].indexOf(axis.name) > -1) {
                                results = axis.columns;
                                break;
                            }
                        }
                    }
                    for (var i = 0, len = results.length; i < len; i++) {
                        var option = $('<option/>');
                        var obj = results[i];
                        var val;
                        if (searchType === searchMethod) {
                            val = obj.value;
                        } else if (searchType === searchAxis) {
                            val = obj.name;
                            axisTypes[val] = {axisType:obj.type, valueType:obj.valueType};
                        }
                        option[0].innerHTML = val;
                        sel.append(option);
                    }
                } else {
                    nce.showNote('Error getting cube data:<hr class="hr-small"/>' + result.data);
                }
            }
            if (defVal) {
                sel.val(defVal);
            } else {
                sel.prepend($('<option/>'));
            }
        };

        _isRefAxis.change(function() {
            _refAxisGroup.toggle();

            var toggleVal = $(this)[0].checked;
            _addAxisTypeName.parent().find('button').prop('disabled', toggleVal);
            _addAxisValueTypeName.parent().find('button').prop('disabled', toggleVal);

            populateSelect(_refAxisApp, getAppsMethod, [] , null, toggleVal);
            _refAxisAxis.empty();
        });
        _hasRefFilter.change(function() {
            _refFilterGroup.toggle();

            var toggleVal = $(this)[0].checked;
            populateSelect(_refFilterApp, getAppsMethod, [], null, toggleVal);
            _refFilterMethod.empty();
        });

        _refAxisApp.change(function() {
            _refAxisVersion.empty();
            _refAxisCube.empty();
            _refAxisAxis.empty();
            populateSelect(_refAxisVersion, getVersionsMethod, [$(this).val(), _refAxisStatus.val(), _refAxisBranch.val()], null, true, true);
        });
        _refFilterApp.change(function() {
            _refFilterVersion.empty();
            _refFilterCube.empty();
            _refFilterMethod.empty();
            populateSelect(_refFilterVersion, getVersionsMethod, [$(this).val(), _refFilterStatus.val(), _refFilterBranch.val()], null, true, true);
        });

        _refAxisVersion.change(function() {
            _refAxisCube.empty();
            _refAxisAxis.empty();
            populateSelect(_refAxisCube, cubeSearchMethod, [appIdFrom(_refAxisApp.val(), $(this).val(), _refAxisStatus.val(), _refAxisBranch.val()), '*', null, true]);
        });
        _refFilterVersion.change(function() {
            _refFilterCube.empty();
            _refFilterMethod.empty();
            populateSelect(_refFilterCube, cubeSearchMethod, [appIdFrom(_refFilterApp.val(), $(this).val(), _refFilterStatus.val(), _refFilterBranch.val()), '*', null, true]);
        });

        _refAxisCube.change(function() {
            _refAxisAxis.empty();
            populateSelectFromCube(_refAxisAxis, [appIdFrom(_refAxisApp.val(), _refAxisVersion.val(), _refAxisStatus.val(), _refAxisBranch.val()), _refAxisCube.val(), {mode:'json'}], searchAxis, null, true);
        });
        _refFilterCube.change(function() {
            _refFilterMethod.empty();
            populateSelectFromCube(_refFilterMethod, [appIdFrom(_refFilterApp.val(), _refFilterVersion.val(), _refFilterStatus.val(), _refFilterBranch.val()), _refFilterCube.val(), {mode:'json'}], searchMethod, null, true);
        });

        _refAxisAxis.change(function() {
            var val = axisTypes[$(this).val()];
            $('#addAxisTypeName').val(val.axisType);
            $('#addAxisValueTypeName').val(val.valueType);
        });
    };

    var appIdFrom = function(app, version, status, branch) {
        return {
            app: app,
            version: version,
            status: status,
            branch: branch
        };
    };

    var addAxis = function() {
        if (!nce.ensureModifiable('Axis cannot be added.')) {
            return;
        }

        var generalTypes = ['STRING', 'LONG', 'BIG_DECIMAL', 'DOUBLE', 'DATE', 'COMPARABLE'];
        var ruleTypes = ['EXPRESSION'];
        buildDropDown('#addAxisTypeList', '#addAxisTypeName', ['DISCRETE', 'RANGE', 'SET', 'NEAREST', 'RULE'], function (selected) {
            if ("RULE" == selected) {
                buildDropDown('#addAxisValueTypeList', '#addAxisValueTypeName', ruleTypes, function () { });
                _addAxisValueTypeName.val('EXPRESSION');
            } else {
                buildDropDown('#addAxisValueTypeList', '#addAxisValueTypeName', generalTypes, function () { });
                _addAxisValueTypeName.val('STRING');
            }
        });
        buildDropDown('#addAxisValueTypeList', '#addAxisValueTypeName', generalTypes, function () { });
        _addAxisName.val('');
        $('#addAxisModal').modal();
    };

    var addAxisOk = function() {
        $('#addAxisModal').modal('hide');
        var axisName = _addAxisName.val();
        var appId = nce.getSelectedTabAppId();
        var cubeName = nce.getSelectedCubeName();
        var params;
        if (_isRefAxis[0].checked) {
            var refAppId = appIdFrom(_refAxisApp.val(), _refAxisVersion.val(), _refAxisStatus.val(), _refAxisBranch.val());
            var refCubeName = _refAxisCube.val();
            var refAxisName = _refAxisAxis.val();
            var filterAppId = null;
            var filterCubeName = null;
            var filterMethodName = null;
            if (_hasRefFilter[0].checked) {
                filterAppId = appIdFrom(_refFilterApp.val(), _refFilterVersion.val(), _refFilterStatus.val(), _refFilterBranch.val());
                filterCubeName = _refFilterCube.val();
                filterMethodName = _refFilterMethod.val();
            }
            params = [refAppId, refCubeName, refAxisName, filterAppId, filterCubeName, filterMethodName];
        } else {
            var axisType = _addAxisTypeName.val();
            var axisValueType = _addAxisValueTypeName.val();
            params = [axisType, axisValueType];
        }
        var result = nce.call("ncubeController.addAxis", [appId, cubeName, axisName].concat(params));
        if (result.status === true) {
            if (hasCustomAxisOrder()) {
                axes.splice(colOffset, 0, {name:axisName});
                storeAxisOrder();
            }
            deleteSavedColumnWidths();
            clearFilters();
            nce.loadCube();
        } else {
            nce.showNote("Unable to add axis '" + axisName + "':<hr class=\"hr-small\"/>" + result.data);
        }
    };

    var deleteAxis = function(axisName) {
        if (!nce.ensureModifiable('Axis cannot be deleted.')) {
            return;
        }

        $('#deleteAxisName').val(axisName);
        $('#deleteAxisModal').modal();
    };

    var deleteAxisOk = function() {
        $('#deleteAxisModal').modal('hide');
        var axisName = $('#deleteAxisName').val();
        var result = nce.call("ncubeController.deleteAxis", [nce.getSelectedTabAppId(), nce.getSelectedCubeName(), axisName]);
        if (result.status === true) {
            var lowerAxisName = axisName.toLowerCase();
            if (_hiddenColumns.hasOwnProperty(lowerAxisName))
            {
                nce.showNote('Hidden column selections for axis ' + axisName + ' removed.', 'Note', 2000);
                delete _hiddenColumns[lowerAxisName];
                storeHiddenColumns();
            }
            if (hasCustomAxisOrder()) {
                var order = JSON.parse(localStorage[getStorageKey(AXIS_ORDER)]);
                axes.splice(order.indexOf(lowerAxisName), 1);
                storeAxisOrder();
            }
            clearFilters();
            deleteSavedColumnWidths();
            nce.loadCube();
        } else {
            nce.showNote("Unable to delete axis '" + axisName + "':<hr class=\"hr-small\"/>" + result.data);
        }
    };

    var updateAxis = function(axisName) {
        if (!nce.ensureModifiable('Axis cannot be updated.')) {
            return false;
        }

        var result = nce.call("ncubeController.getAxis", [nce.getSelectedTabAppId(), nce.getSelectedCubeName(), axisName]);
        var axis;
        if (result.status === true) {
            axis = result.data;
        } else {
            nce.showNote("Could not retrieve axis: " + axisName + " for n-cube '" + nce.getSelectedCubeName() + "':<hr class=\"hr-small\"/>" + result.data);
            return;
        }
        var isRule = axis.type.name == 'RULE';
        var isNearest = axis.type.name == 'NEAREST';
        _updateAxisName.val(axisName);
        _updateAxisTypeName.val(axis.type.name);
        _updateAxisValueTypeName.val(axis.valueType.name);
        $('#updateAxisDefaultCol').prop({'checked': axis.defaultCol != null});
        if (isRule) {
            hideAxisSortOption();
            showAxisDefaultColumnOption(axis);
            showAxisFireAllOption(axis);
        }
        else if (isNearest) {
            hideAxisSortOption();
            hideAxisDefaultColumnOption();
            hideAxisFireAllOption();
        }
        else {
            showAxisSortOption(axis);
            showAxisDefaultColumnOption(axis);
            hideAxisFireAllOption();
        }

        if (axis.isRef) {
            _updateAxisSortOrder.prop('disabled', true);
            var metaProps = axis.metaProps;
            _refAxisGroupUpdate.show();
            _isRefAxisUpdate[0].checked = true;
            if (metaProps.transformApp) {
                _refFilterGroupUpdate.show();
                _hasRefFilterUpdate[0].checked = true;
            } else {
                _refFilterGroupUpdate.hide();
                _hasRefFilterUpdate[0].checked = false;
                _refFilterGroupUpdate.find('input').val('');
            }
            _refAxisBranchUpdate.val(metaProps.referenceBranch);
            _refAxisStatusUpdate.val(metaProps.referenceStatus);
            _refAxisAppUpdate.val(metaProps.referenceApp);
            _refAxisVersionUpdate.val(metaProps.referenceVersion);
            _refAxisCubeUpdate.val(metaProps.referenceCubeName);
            _refAxisAxisUpdate.val(metaProps.referenceAxisName);
            _refFilterBranchUpdate.val(metaProps.transformBranch);
            _refFilterStatusUpdate.val(metaProps.transformStatus);
            _refFilterAppUpdate.val(metaProps.transformApp);
            _refFilterVersionUpdate.val(metaProps.transformVersion);
            _refFilterCubeUpdate.val(metaProps.transformCubeName);
            _refFilterMethodUpdate.val(metaProps.transformMethodName);
        } else {
            _refAxisGroupUpdate.hide();
            _refFilterGroupUpdate.hide();
            _isRefAxisUpdate[0].checked = false;
            _hasRefFilterUpdate[0].checked = false;
            _refAxisGroupUpdate.find('input').val('');
            _refFilterGroupUpdate.find('input').val('');
        }

        _axisName = axisName;
        $('#updateAxisModal').modal({
            keyboard: true
        });
    };

    var showAxisSortOption = function(axis) {
        $('#updateAxisSortOrderRow').show();
        _updateAxisSortOrder.prop({'checked': axis.preferredOrder == 0, 'disabled': false});
    };

    var hideAxisSortOption = function() {
        $('#updateAxisSortOrderRow').hide();
    };

    var showAxisDefaultColumnOption = function(axis) {
        $('#updateAxisDefaultColRow').show();
        $('#updateAxisDefaultCol').prop({'checked': axis.defaultCol != null, 'disabled': false});
    };

    var hideAxisDefaultColumnOption = function() {
        $('#updateAxisDefaultColRow').hide();
    };

    var showAxisFireAllOption = function(axis) {
        $('#updateAxisFireAllRow').show();
        $('#updateAxisFireAll').prop({'checked': axis.fireAll == true, 'disabled': false});
    };

    var hideAxisFireAllOption = function() {
        $('#updateAxisFireAllRow').hide();
    };

    var updateAxisOk = function() {
        $('#updateAxisModal').modal('hide');
        var axisName = $('#updateAxisName').val();
        var hasDefault = $('#updateAxisDefaultCol').prop('checked');
        var sortOrder = _updateAxisSortOrder.prop('checked');
        var fireAll = $('#updateAxisFireAll').prop('checked');
        var result = nce.call("ncubeController.updateAxis", [nce.getSelectedTabAppId(), nce.getSelectedCubeName(), _axisName, axisName, hasDefault, sortOrder, fireAll]);
        if (result.status === true) {
            var oldName = _axisName.toLowerCase();
            var newName = axisName.toLowerCase();
            if (oldName != newName)
            {
                _hiddenColumns[newName] = _hiddenColumns[oldName];
                delete _hiddenColumns[oldName];
                storeHiddenColumns();

                if (hasCustomAxisOrder()) {
                    var order = JSON.parse(localStorage[getStorageKey(AXIS_ORDER)]);
                    axes[order.indexOf(oldName)].name = newName;
                    storeAxisOrder();
                }
            }
            nce.loadCube();
        } else {
            nce.showNote("Unable to update axis '" + _axisName + "':<hr class=\"hr-small\"/>" + result.data);
        }
    };

    // =============================================== End Axis Editing ================================================


    var render = function() {
        if (!hot) {
            return;
        }
        hot.render();
    };

    var reload = function() {
        if (hot) {
            var selection = getSelectedCellRange();
            load();

            if (selection) {
                hot.selectCell(selection.startRow, selection.startCol, selection.endRow, selection.endCol, true);
            } else {
                selectSavedOrDefaultCell();
            }
        }
    };

    var selectSavedOrDefaultCell = function() {
        if (hot) {
            var pos = nce.getViewPosition();
            var row, col;
            if (typeof pos === 'object') {
                row = pos.row;
                col = pos.col;
            } else {
                row = 2;
                col = axes.length === 1 ? 1 : colOffset;
            }
            hot.selectCell(row, col);
        }
    };

    var handleCubeSelected = function() {
        load();
    };

    // Let parent (main frame) know that the child window has loaded.
    // The loading of all of the Javascript (deeply) is continuous on the main thread.
    // Therefore, the setTimeout(, 1) ensures that the main window (parent frame)
    // is called after all Javascript has been loaded.
    if (window.parent.frameLoaded) {
        setTimeout(function () {
            window.parent.frameLoaded();
        }, 1);
    }

    // API
    return {
        init: init,
        handleCubeSelected: handleCubeSelected,
        load: load,
        reload: reload,
        render: render
    };

})(jQuery);

var tabActivated = function tabActivated(info) {
    NCubeEditor2.init(info);
    NCubeEditor2.load();
};

var cubeSelected = function cubeSelected() {
    NCubeEditor2.handleCubeSelected();
};