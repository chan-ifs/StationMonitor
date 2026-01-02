import { useState, useEffect } from "react";
import { getData } from "../demo/data";
import { Gantt, Willow } from "@svar-ui/react-gantt"; //import theme and component
import "@svar-ui/react-gantt/all.css"; //import css file from the package
import { getGanttData } from './TasksInfo';

export default function App() {
  const [data, setData] = useState<{ tasks: any[]; links: any[]; scales?: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const cellHeight = 25;
  const scaleHeight = 25;

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
      <Gantt 
      tasks={data.tasks} 
      links={data.links}
      cellHeight={cellHeight}
      scaleHeight={scaleHeight}/>
      {/* <Gantt tasks={data.tasks} /> */}
      </Willow>
  );
}