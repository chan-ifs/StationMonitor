import { useRef, useEffect, useState } from 'react';
import { BryntumGantt, BryntumGanttProjectModel, BryntumGanttProjectModelProps, BryntumGanttProps } from '@bryntum/gantt-react';
import { getProjectProps } from './GanttProjectProps';
import { ganttProps } from './GanttProps';
import { Box, CircularProgress, Typography } from '@mui/material';

const StationGantt = (props: BryntumGanttProps) => {

    const projectRef = useRef<BryntumGanttProjectModel>(null);
    const [projectProps, setProjectProps] = useState<BryntumGanttProjectModelProps | null>(null);
    const [apiData, setApiData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProjectData = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await getProjectProps();
                setProjectProps(result.props);
                if (result.data) {
                    setApiData(result.data);
                }
            } catch (err: any) {
                console.error('Error loading project data:', err);
                setError(err.message || 'Failed to load project data');
            } finally {
                setLoading(false);
            }
        };

        loadProjectData();
    }, []);

    // Load API data after project model is ready
    useEffect(() => {
        if (apiData && projectRef.current?.instance) {
            const project = projectRef.current.instance;
            // Assign data directly to project stores
            if (apiData.tasks?.rows) {
                project.taskStore.data = apiData.tasks.rows;
            }
            if (apiData.dependencies?.rows) {
                project.dependencyStore.data = apiData.dependencies.rows;
            }
            if (apiData.calendars?.rows) {
                project.calendarManagerStore.data = apiData.calendars.rows;
            }
            // Set project properties if provided
            if (apiData.project) {
                if (apiData.project.startDate) {
                    project.startDate = new Date(apiData.project.startDate);
                }
            }
        }
    }, [apiData]);

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: 'calc(100vh - 120px)',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>Loading Gantt data...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: 'calc(100vh - 120px)',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4
            }}>
                <Typography variant="h6" color="error">Error Loading Data</Typography>
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>{error}</Typography>
            </Box>
        );
    }

    if (!projectProps) {
        return null;
    }

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: 'calc(100vh - 120px)', // Adjust based on Header/Footer height
            width: '100%',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <BryntumGanttProjectModel
                ref={projectRef}
                {...projectProps}
            />
            <Box sx={{ 
                flex: 1, 
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                '& > *': {
                    height: '100%',
                    width: '100%',
                    flex: '1 1 auto'
                }
            }}>
                <BryntumGantt
                    {...ganttProps}
                    {...props}
                    project={projectRef}
                />
            </Box>
        </Box>
    );
};

export default StationGantt;
