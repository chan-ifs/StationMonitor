import { Column, ColumnConfig, ColumnStore } from '@bryntum/gantt';
import Task from './Task';

export default class StatusColumn extends Column {
    static $name         = 'StatusColumn';
    static type          = 'statuscolumn';
    static isGanttColumn = true;

    static defaults = {
        // Set your default instance config properties here
        field      : 'status',
        text       : 'Status',
        editor     : false,
        cellCls    : 'b-status-column-cell',
        htmlEncode : false,
        filterable : {
            filterField : {
                type  : 'combo',
                items : ['Not Started', 'Started', 'Completed', 'Late']
            }
        },
        renderer({ record }) {
            const status = (record as Task).status;

            return status ? [{
                tag       : 'i',
                className : `fa fa-circle ${status}`
            }, status] : '';
        }
    } as ColumnConfig;

}

ColumnStore.registerColumnType(StatusColumn);
