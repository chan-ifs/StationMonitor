import {
    ButtonListenersTypes, ColumnStore, ComboListenersTypes, DateHelper, Gantt, GanttFeaturesType, Menu, MenuItem,
    MenuItemListenersTypes, MenuListenersTypes, Model, NameColumn, Slider, SliderListenersTypes, TaskModel,
    TextFieldListenersTypes, Toolbar, ToolbarConfig, UndoRedoConfig, Widget
} from '@bryntum/gantt';

class CheckboxMenuItem extends MenuItem {
    feature?: keyof GanttFeaturesType;
    subGrid?: string;
}

export default class GanttToolbar extends Toolbar {

    static type = 'gantttoolbar';

    static $name = 'GanttToolbar';

    gantt!: Gantt;
    styleNode!: HTMLElement;

    // static configurable = {
    //     items : [
    //         {
    //             type : 'button',
    //             ref : 'addTaskButton',
    //             icon : 'fa fa-plus',
    //             text : 'Create',
    //             tooltip : 'Create new task',
    //         }
    //     ]
    // } as ToolbarConfig;

    static configurable = {
        items : [
            {
                type     : 'button',
                ref      : 'addTaskButton',
                color    : 'b-green',
                icon     : 'fa fa-plus',
                text     : 'Create',
                tooltip  : 'Create new task',
                onAction : 'up.onAddTaskClick'
            },
            {
                type  : 'undoredo',
                ref   : 'undoRedo',
                items : {
                    transactionsCombo : null
                }
            } as UndoRedoConfig,
            {
                type  : 'buttonGroup',
                ref   : 'toggleButtons',
                items : [
                    {
                        type     : 'button',
                        ref      : 'expandAllButton',
                        icon     : 'fa fa-angle-double-down',
                        tooltip  : 'Expand all',
                        onAction : 'up.onExpandAllClick'
                    },
                    {
                        type     : 'button',
                        ref      : 'collapseAllButton',
                        icon     : 'fa fa-angle-double-up',
                        tooltip  : 'Collapse all',
                        onAction : 'up.onCollapseAllClick'
                    }
                ]
            },
            {
                type  : 'buttonGroup',
                ref   : 'zoomButtons',
                items : [
                    {
                        type     : 'button',
                        ref      : 'zoomInButton',
                        icon     : 'fa fa-search-plus',
                        tooltip  : 'Zoom in',
                        onAction : 'up.onZoomInClick'
                    },
                    {
                        type     : 'button',
                        ref      : 'zoomOutButton',
                        icon     : 'fa fa-search-minus',
                        tooltip  : 'Zoom out',
                        onAction : 'up.onZoomOutClick'
                    },
                    {
                        type     : 'button',
                        ref      : 'zoomToFitButton',
                        icon     : 'fa fa-compress-arrows-alt',
                        tooltip  : 'Zoom to fit',
                        onAction : 'up.onZoomToFitClick'
                    },
                    {
                        type     : 'button',
                        ref      : 'previousButton',
                        icon     : 'fa fa-angle-left',
                        tooltip  : 'Previous time span',
                        onAction : 'up.onShiftPreviousClick'
                    },
                    {
                        type     : 'button',
                        ref      : 'nextButton',
                        icon     : 'fa fa-angle-right',
                        tooltip  : 'Next time span',
                        onAction : 'up.onShiftNextClick'
                    }
                ]
            },
            // {
            //     type         : 'combo',
            //     label        : 'Choose project',
            //     editable     : false,
            //     inputWidth   : '14em',
            //     displayField : 'name',
            //     value        : 1,
            //     store        : {
            //         data : [
            //             {
            //                 id   : 1,
            //                 name : 'Launch SaaS',
            //                 url  : 'data/launch-saas.json'
            //             },
            //             {
            //                 id   : 2,
            //                 name : 'Build cool app',
            //                 url  : 'data/tasks-workedhours.json'
            //             }
            //         ]
            //     },
            //     listeners : {
            //         select : 'up.onProjectSelected'
            //     },
            //     triggers : {
            //         editProject : {
            //             tooltip : 'Edit project',
            //             cls     : 'fa fa-edit',
            //             handler : 'up.onProjectEditorButtonClick'
            //         }
            //     }
            // },
            {
                type : 'widget',
                ref  : 'spacer',
                cls  : 'b-toolbar-fill'
            },
            {
                type                 : 'textfield',
                ref                  : 'filterByName',
                cls                  : 'filter-by-name',
                flex                 : '0 0 14em',
                placeholder          : 'Find tasks by name',
                clearable            : true,
                keyStrokeChangeDelay : 100,
                triggers             : {
                    filter : {
                        align : 'end',
                        cls   : 'fa fa-filter'
                    }
                },
                onChange : 'up.onFilterChange'
            },
            {
                type    : 'button',
                ref     : 'featuresButton',
                icon    : 'fa fa-tasks',
                text    : 'Settings',
                tooltip : 'Toggle features',
                menu    : {
                    onItem       : 'up.onFeaturesClick',
                    onBeforeShow : 'up.onFeaturesShow',
                    items        : [
                        {
                            type : 'menuitem',
                            ref  : 'settings',
                            text : 'UI settings',
                            icon : 'fa fa-sliders-h',
                            menu : {
                                cls          : 'settings-menu',
                                layout       : 'vbox',
                                onBeforeShow : 'up.onSettingsShow',
                                defaults     : {
                                    type       : 'slider',
                                    showValue  : true,
                                    labelWidth : '10em',
                                    width      : '25em'
                                },
                                items : [
                                    {
                                        type    : 'slider',
                                        ref     : 'rowHeight',
                                        text    : 'Row height',
                                        unit    : 'px',
                                        min     : 30,
                                        max     : 70,
                                        onInput : 'up.onRowHeightChange'
                                    },
                                    {
                                        type    : 'slider',
                                        ref     : 'barMargin',
                                        text    : 'Bar margin',
                                        unit    : 'px',
                                        min     : 0,
                                        max     : 10,
                                        onInput : 'up.onBarMarginChange'
                                    },
                                    {
                                        type    : 'slider',
                                        ref     : 'duration',
                                        text    : 'Animation duration',
                                        unit    : 'ms',
                                        min     : 0,
                                        max     : 2000,
                                        step    : 100,
                                        onInput : 'up.onAnimationDurationChange'
                                    },
                                    {
                                        type    : 'slider',
                                        ref     : 'radius',
                                        text    : 'Dependency radius',
                                        unit    : 'px',
                                        min     : 0,
                                        max     : 10,
                                        onInput : 'up.onDependencyRadiusChange'
                                    }
                                ]
                            }
                        },
                        {
                            type    : 'menuitem',
                            ref     : 'showWbs',
                            text    : 'Show WBS code',
                            checked : true,
                            onItem  : 'up.onShowWBSToggle'
                        },
                        {
                            type    : 'menuitem',
                            ref     : 'drawDeps',
                            text    : 'Draw dependencies',
                            feature : 'dependencies',
                            checked : false
                        },
                        {
                            type    : 'menuitem',
                            ref     : 'taskLabels',
                            text    : 'Task labels',
                            feature : 'labels',
                            checked : false
                        },
                        {
                            type    : 'menuitem',
                            ref     : 'criticalPaths',
                            text    : 'Critical paths',
                            feature : 'criticalPaths',
                            tooltip : 'Highlight critical paths',
                            checked : false
                        },
                        {
                            type    : 'menuitem',
                            ref     : 'projectLines',
                            text    : 'Project lines',
                            feature : 'projectLines',
                            checked : false
                        },
                        {
                            type    : 'menuitem',
                            ref     : 'nonWorkingTime',
                            text    : 'Highlight non-working time',
                            feature : 'nonWorkingTime',
                            checked : false
                        },
                        {
                            type    : 'menuitem',
                            ref     : 'cellEdit',
                            text    : 'Enable cell editing',
                            feature : 'cellEdit',
                            checked : false
                        },
                        {
                            type    : 'menuitem',
                            ref     : 'autoEdit',
                            text    : 'Auto edit',
                            checked : false,
                            onItem  : 'up.onAutoEditToggle'
                        },
                        {
                            type    : 'menuitem',
                            ref     : 'columnLines',
                            text    : 'Show column lines',
                            feature : 'columnLines',
                            checked : true
                        },
                        {
                            type    : 'menuitem',
                            ref     : 'rowLines',
                            text    : 'Show row lines',
                            onItem  : 'up.onRowLinesToggle',
                            checked : true
                        },
                        {
                            type    : 'menuitem',
                            ref     : 'baselines',
                            text    : 'Show baselines',
                            feature : 'baselines',
                            checked : false
                        },
                        {
                            type    : 'menuitem',
                            ref     : 'rollups',
                            text    : 'Show rollups',
                            feature : 'rollups',
                            checked : false
                        },
                        {
                            type    : 'menuitem',
                            ref     : 'progressLine',
                            text    : 'Show progress line',
                            feature : 'progressLine',
                            checked : false
                        },
                        {
                            type    : 'menuitem',
                            ref     : 'parentArea',
                            text    : 'Show parent area',
                            feature : 'parentArea',
                            checked : false
                        },
                        {
                            type    : 'menuitem',
                            ref     : 'hideSchedule',
                            text    : 'Hide schedule',
                            cls     : 'b-separator',
                            subGrid : 'normal',
                            checked : false
                        }
                    ]
                }
            }
        ]
    } as ToolbarConfig;

    // Called when toolbar is added to the Gantt panel
    set parent(parent) {
        // @ts-ignore - Setting parent property on super to avoid recursion
        super.parent = parent;
        const me     = this;

        me.gantt = parent as Gantt;

        me.styleNode = document.createElement('style');
        document.head.appendChild(me.styleNode);
    }

    get parent() {
        // @ts-ignore - parent is managed by Bryntum framework
        return super.parent;
    }

    // region controller methods

    onAddTaskClick = async() => {
        const
            { gantt } = this,
            added     = gantt.taskStore.rootNode.appendChild({
                name     : 'New task',
                duration : 1
            }) as Model;

        // wait for immediate commit to calculate new task fields
        await gantt.project.commitAsync();

        // scroll to the added task
        await gantt.scrollRowIntoView(added);

        await gantt.features.cellEdit.startEditing({
            record : added,
            field  : 'name'
        });
    };

    onExpandAllClick = () => {
        this.gantt.expandAll();
    };

    onCollapseAllClick = () => {
        this.gantt.collapseAll();
    };

    onZoomInClick = () => {
        this.gantt.zoomIn();
    };

    onZoomOutClick = () => {
        this.gantt.zoomOut();
    };

    onZoomToFitClick = () => {
        this.gantt.zoomToFit({
            leftMargin  : 50,
            rightMargin : 50
        });
    };

    onShiftPreviousClick = () => {
        this.gantt.shiftPrevious();
    };

    onShiftNextClick = () => {
        this.gantt.shiftNext();
    };

    onAutoEditToggle: MenuItemListenersTypes['item'] = ({ item }) => {
        this.gantt.features.cellEdit.autoEdit = item.checked;
    };

    onRowLinesToggle: MenuItemListenersTypes['item'] = ({ item }) => {
        this.gantt.rowLines = item.checked;
    };

    onFilterChange: TextFieldListenersTypes['change'] = ({ value }) => {
        if (value === '') {
            this.gantt.taskStore.clearFilters();
        }
        else {
            value = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            this.gantt.taskStore.filter({
                filters : (task: TaskModel) => task.name && task.name.match(new RegExp(value, 'i')),
                replace : true
            });
        }
    };

    onFeaturesClick: MenuListenersTypes['item'] = ({ item }) => {
        const
            { gantt } = this,
            checkbox  = item as Widget as CheckboxMenuItem;

        if (checkbox.feature) {
            const feature    = gantt.features[checkbox.feature];
            feature.disabled = !feature.disabled;
        }
        else if (checkbox.subGrid) {
            const subGrid     = gantt.subGrids[checkbox.subGrid];
            subGrid.collapsed = !subGrid.collapsed;
        }
    };

    onFeaturesShow: MenuListenersTypes['beforeShow'] = ({ source }) => {
        const
            { gantt } = this,
            menu      = source as Menu;

        (menu.items as Widget[]).map(item => {
            const
                checkbox    = item as CheckboxMenuItem,
                { feature } = checkbox;

            if (feature) {
                // a feature might be not presented in the gantt
                // (the code is shared between "advanced" and "php" demos which use a bit different set of features)
                if (gantt.features[feature]) {
                    checkbox.checked = !gantt.features[feature].disabled;
                }
                // hide not existing features
                else {
                    item.hide();
                }
            }
            else if (checkbox.subGrid) {
                checkbox.checked = gantt.subGrids[checkbox.subGrid].collapsed;
            }
        });
    };

    onProjectEditorButtonClick = () => {
        this.gantt.editProject();
    };

    onProjectSelected: ComboListenersTypes['select'] = async({ record, userAction }) => {
        // react on user actions only
        if (userAction) {
            const { gantt } = this;

            await gantt.project.load((record as any).url);

            gantt.zoomToFit();
            gantt.visibleDate = {
                date  : DateHelper.add(gantt.project.startDate, -1, 'week'),
                block : 'start'
            };
        }
    };

    onSettingsShow: MenuListenersTypes['beforeShow'] = ({ source }) => {
        const
            { gantt }     = this,
            { widgetMap } = source,
            rowHeight     = widgetMap.rowHeight as Slider,
            barMargin     = widgetMap.barMargin as Slider,
            duration      = widgetMap.duration as Slider;

        rowHeight.value = gantt.rowHeight;
        barMargin.value = gantt.barMargin;
        barMargin.max   = gantt.rowHeight / 2 - 5;
        duration.value  = gantt.transitionDuration;
    };

    onRowHeightChange: SliderListenersTypes['input'] = ({ source, value }) => {
        this.gantt.rowHeight = value;
        ((source.owner as Menu).widgetMap.barMargin as Slider).max = (value / 2) - 5;
    };

    onBarMarginChange: SliderListenersTypes['input'] = ({ value }) => {
        this.gantt.barMargin = value;
    };

    onAnimationDurationChange: SliderListenersTypes['input'] = ({ value }) => {
        this.gantt.transitionDuration = value;
        this.styleNode.innerHTML      = `.b-animating .b-gantt-task-wrap { transition-duration: ${value / 1000}s !important; }`;
    };

    onDependencyRadiusChange: SliderListenersTypes['input'] = ({ value }) => {
        this.gantt.features.dependencies.radius = value;
    };

    onCriticalPathsClick: ButtonListenersTypes['click'] = ({ source }) => this.gantt.features.criticalPaths.disabled = !source.pressed;

    onShowWBSToggle: MenuItemListenersTypes['item'] = ({ item }) => ((this.gantt.columns as ColumnStore).get('name') as NameColumn).showWbs = item.checked;

    // endregion
}

// Register this widget type with its Factory
GanttToolbar.initClass();
