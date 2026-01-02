// Transform API data format to Bryntum Gantt format
import { getGanttData } from './TasksInfo';

export interface BryntumGanttData {
    success: boolean;
    project?: {
        calendar?: string;
        startDate?: string;
        hoursPerDay?: number;
        daysPerWeek?: number;
        daysPerMonth?: number;
    };
    tasks?: {
        rows: any[];
    };
    dependencies?: {
        rows: any[];
    };
    calendars?: {
        rows: any[];
    };
}

/**
 * Transform API task data to Bryntum format
 * API format: { id, text, type, start, end, parent, progress, duration, ... }
 * Bryntum format: { id, name, startDate, endDate, duration, percentDone, parent, children, ... }
 */
function transformTaskToBryntum(task: any): any {
    const bryntumTask: any = {
        id: task.id,
        name: task.text || task.name || `Task ${task.id}`,
        percentDone: task.progress || 0,
    };

    // Handle dates
    if (task.start) {
        const startDate = task.start instanceof Date ? task.start : new Date(task.start);
        bryntumTask.startDate = startDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    if (task.end) {
        const endDate = task.end instanceof Date ? task.end : new Date(task.end);
        bryntumTask.endDate = endDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    // Handle duration
    if (task.duration !== undefined && task.duration !== null) {
        bryntumTask.duration = task.duration;
    } else if (task.start && task.end) {
        const start = task.start instanceof Date ? task.start : new Date(task.start);
        const end = task.end instanceof Date ? task.end : new Date(task.end);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        bryntumTask.duration = diffDays;
    }

    // Handle parent/children relationship
    if (task.parent !== null && task.parent !== undefined) {
        bryntumTask.parentId = task.parent;
    }

    // Handle expanded state
    if (task.open !== undefined) {
        bryntumTask.expanded = task.open;
    }

    // Copy other properties
    if (task.type) {
        bryntumTask.type = task.type;
    }

    return bryntumTask;
}

/**
 * Transform API link data to Bryntum dependencies format
 * API format: { id, type, source, target }
 * Bryntum format: { id, from, to, type }
 */
function transformLinkToBryntum(link: any): any {
    return {
        id: link.id,
        from: link.source,
        to: link.target,
        type: link.type || 0, // 0 = FinishToStart
    };
}

/**
 * Build hierarchical task structure with children
 */
function buildTaskHierarchy(tasks: any[]): any[] {
    const taskMap = new Map();
    const rootTasks: any[] = [];

    // First pass: create all tasks
    tasks.forEach(task => {
        const bryntumTask = transformTaskToBryntum(task);
        taskMap.set(task.id, bryntumTask);
    });

    // Second pass: build hierarchy
    tasks.forEach(task => {
        const bryntumTask = taskMap.get(task.id);
        
        if (task.parent !== null && task.parent !== undefined) {
            const parentTask = taskMap.get(task.parent);
            if (parentTask) {
                if (!parentTask.children) {
                    parentTask.children = [];
                }
                parentTask.children.push(bryntumTask);
            } else {
                // Parent not found, treat as root
                rootTasks.push(bryntumTask);
            }
        } else {
            rootTasks.push(bryntumTask);
        }
    });

    return rootTasks;
}

/**
 * Transform API data to Bryntum Gantt format
 */
export async function transformToBryntumFormat(): Promise<BryntumGanttData> {
    try {
        const apiData = await getGanttData('default');
        
        // Build hierarchical task structure
        const tasks = buildTaskHierarchy(apiData.tasks || []);
        
        // Transform links to dependencies
        const dependencies = (apiData.links || []).map((link: any) => transformLinkToBryntum(link));

        // Calculate project start/end dates from tasks
        let projectStartDate: string | undefined;
        let projectEndDate: string | undefined;

        if (tasks.length > 0) {
            const allDates: Date[] = [];
            tasks.forEach(task => {
                if (task.startDate) allDates.push(new Date(task.startDate));
                if (task.endDate) allDates.push(new Date(task.endDate));
                // Also check children
                if (task.children) {
                    task.children.forEach((child: any) => {
                        if (child.startDate) allDates.push(new Date(child.startDate));
                        if (child.endDate) allDates.push(new Date(child.endDate));
                    });
                }
            });

            if (allDates.length > 0) {
                const sortedDates = allDates.sort((a, b) => a.getTime() - b.getTime());
                projectStartDate = sortedDates[0].toISOString().split('T')[0];
                projectEndDate = sortedDates[sortedDates.length - 1].toISOString().split('T')[0];
            }
        }

        return {
            success: true,
            project: {
                calendar: 'general',
                startDate: projectStartDate || new Date().toISOString().split('T')[0],
                hoursPerDay: 24,
                daysPerWeek: 5,
                daysPerMonth: 20,
            },
            tasks: {
                rows: tasks,
            },
            dependencies: {
                rows: dependencies,
            },
            calendars: {
                rows: [
                    {
                        id: 'general',
                        name: 'General',
                        intervals: [
                            {
                                recurrentStartDate: 'on Sat',
                                recurrentEndDate: 'on Mon',
                                isWorking: false,
                            },
                        ],
                        expanded: true,
                    },
                ],
            },
        };
    } catch (error) {
        console.error('Error transforming Gantt data:', error);
        // Return empty structure on error
        return {
            success: false,
            project: {
                calendar: 'general',
                startDate: new Date().toISOString().split('T')[0],
                hoursPerDay: 24,
                daysPerWeek: 5,
                daysPerMonth: 20,
            },
            tasks: {
                rows: [],
            },
            dependencies: {
                rows: [],
            },
            calendars: {
                rows: [
                    {
                        id: 'general',
                        name: 'General',
                        intervals: [
                            {
                                recurrentStartDate: 'on Sat',
                                recurrentEndDate: 'on Mon',
                                isWorking: false,
                            },
                        ],
                        expanded: true,
                    },
                ],
            },
        };
    }
}

