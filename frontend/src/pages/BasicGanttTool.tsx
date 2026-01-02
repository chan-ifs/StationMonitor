import { useState, useEffect, useCallback } from "react";
import { getData } from "../demo/data";
import { Gantt, Willow } from "@svar-ui/react-gantt"; //import theme and component
import "@svar-ui/react-gantt/all.css"; //import css file from the package
import { getGanttData } from './TasksInfo';
import GanttToolbar from '../utils/ganttToolbar';

export default function BasicGanttTool() {
  const [data, setData] = useState<{ tasks: any[]; links: any[]; scales?: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<any>(null);
  const cellHeight = 25;
  const scaleHeight = 25;

  // Initialize Gantt API and set up zoom event listener
  const initGantt = useCallback((ganttApi: any) => {
    setApi(ganttApi);
    // Listen to zoom-scale events (triggered by mouse wheel zoom)
    if (ganttApi) {
      ganttApi.on('zoom-scale', () => {
        console.log('Zoom level changed:', ganttApi.getState().zoom);
      });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ganttData = await getGanttData();
        // const ganttData = getData();
        setData(ganttData);
        console.log(ganttData);
      } catch (error) {
        console.error('Error loading gantt data:', error);
        // Fallback to static data on error
        setData(getData());
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return <div>Loading...</div>;
  }

  return (
    <Willow>
      <GanttToolbar api={api} />
      <Gantt 
      init={initGantt}
      tasks={data.tasks} 
      links={data.links}
      cellHeight={cellHeight}
      scaleHeight={scaleHeight}
      zoom={true}/>
      {/* <Gantt tasks={data.tasks} /> */}
      </Willow>
  );
}

