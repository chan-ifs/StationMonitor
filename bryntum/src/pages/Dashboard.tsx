import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { dashboardService } from '../services/api';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await dashboardService.getData();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : (
            <Box sx={{ mt: 3 }}>
              {dashboardData && (
                <>
                  <Typography variant="h6" gutterBottom>
                    {dashboardData.message}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Logged in as: {dashboardData.user}
                  </Typography>
                </>
              )}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Station Monitor System
                </Typography>
                <Typography variant="body1" paragraph>
                  This is your dashboard. You can add monitoring features, station data,
                  and other functionality here.
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Link
                    component="button"
                    variant="body1"
                    onClick={() => navigate('/station-gantt')}
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      color: 'primary.main',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Gantt Chart
                  </Link>
                  <Link
                    component="button"
                    variant="body1"
                    // onClick={() => navigate('/gantt-chart2')}
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      color: 'primary.main',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Gantt Chart2
                  </Link>
                  <Link
                    component="button"
                    variant="body1"
                    // onClick={() => navigate('/basic-gantt-tool')}
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      color: 'primary.main',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Basic Gantt Tool
                  </Link>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
  );
};

export default Dashboard;

