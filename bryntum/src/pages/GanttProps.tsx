import { BryntumGanttProps } from '@bryntum/gantt-react';
import '../lib/StatusColumn';
import '../lib/GanttToolbar';

export const ganttProps: BryntumGanttProps = {

    startDate : '2025-01-07',
    endDate   : '2025-03-24',

    tbar : {
        // @ts-ignore Custom application component type
        type : 'gantttoolbar'
    } as any,

    dependencyIdField : 'wbsCode',

    selectionMode : {
        cell       : true,
        dragSelect : true,
        rowNumber  : true
    },

    resourceImagePath : 'users/',

    columns : [
        // { type : 'wbs', hidden : true },
        { type : 'name', width : 250, showWbs : true },
        { type : 'startdate' },
        { type : 'duration' },
        { type : 'resourceassignment', width : 120, showAvatars : true },
        { type : 'percentdone', mode : 'circle', width : 70 },
        // { type : 'predecessor', width : 112 },
        // { type : 'successor', width : 112 },
        { type : 'schedulingmodecolumn' },
        { type : 'calendar' },
        // { type : 'constrainttype' },
        { type : 'constraintdate' },
        // @ts-ignore Custom application component type
        { type : 'statuscolumn' },
        { type : 'date', text : 'Deadline', field : 'deadline' },
        { type : 'addnew' }
    ],

    subGridConfigs : {
        locked : {
            flex : 3
        },
        normal : {
            flex : 4
        }
    },

    columnLines : false,

    rollupsFeature : {
        disabled : true
    },

    baselinesFeature : {
        disabled : true
    },

    progressLineFeature : {
        disabled   : true,
        statusDate : new Date(2025, 0, 25)
    },

    projectEditFeature : true,

    filterFeature : true,

    dependencyEditFeature : true,

    timeRangesFeature : {
        showCurrentTimeLine : true
    },

    labelsFeature : {
        before : {
            field  : 'name',
            editor : {
                type : 'textfield'
            }
        }
    }
};
