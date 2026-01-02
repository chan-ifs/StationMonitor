import { BryntumGanttProjectModelProps } from '@bryntum/gantt-react';
import Task from '../lib/Task';
import config from '../config/config.json';
import { transformToBryntumFormat } from '../lib/transformGanttData';

// Function to get project props based on config
export async function getProjectProps(): Promise<{ props: BryntumGanttProjectModelProps; data?: any }> {
    const baseProps: BryntumGanttProjectModelProps = {
        autoSetConstraints: true,
        taskModelClass: Task,
        autoLoad: false, // We'll load manually
        stm: {
            autoRecord: true,
        },
    };

    // Check config to determine data source
    if (config.useDemoData) {
        // Use demo data file
        return {
            props: {
                ...baseProps,
                loadUrl: `data/${config.demoDataFile || 'demodata.json'}`,
                autoLoad: true,
            },
        };
    } else {
        // Load data from API and transform to Bryntum format
        const bryntumData = await transformToBryntumFormat();
        return {
            props: baseProps,
            data: bryntumData, // Return data separately to load via project.load()
        };
    }
}

// For backward compatibility, export default props
export const projectProps: BryntumGanttProjectModelProps = {
    autoSetConstraints: true,
    taskModelClass: Task,
    loadUrl: 'data/demodata.json',
    autoLoad: true,
    stm: {
        autoRecord: true,
    },
};
