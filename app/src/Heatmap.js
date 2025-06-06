// import React, { useState,useEffect } from 'react';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
// import TextField from '@mui/material/TextField';
// import { Button} from '@mui/material';




// const Heatmap = ({ onHeatmapDataReceived, heatmapVisible, onToggleHeatmap,polygons }) => {
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [lastSelectedDate, setLastSelectedDate] = useState(null);
 
 
  

//   const handleDateChange = (date) => {
//     setSelectedDate(date);
//   };

//   const handleSubmit = () => {
//     if (!selectedDate) {
//       console.log("Please select a date and time.");
//       return;
//     }
    
//     if (selectedDate !== lastSelectedDate) {
//         // Fetch heatmap data for the selected date
//         fetchHeatmapData(selectedDate);
  
//         // Update the last selected date
//         setLastSelectedDate(selectedDate);
//       }
//     // Toggle heatmap visibility
//     onToggleHeatmap();
//   };

//   useEffect(() => {
//     if (!heatmapVisible) {
//       setLastSelectedDate(null);
//     }
//   }, [heatmapVisible]);

//   const fetchHeatmapData = (selectedDate) => {
//     // Format the selected date to match the API's query string format
//     const formData = {
//       hour: selectedDate.format("H"), // Get the hour in 24-hour format
//       day: selectedDate.date(),
//       month: selectedDate.month() + 1,
//     };

//     const apiUrl = 'http://127.0.0.1:8000/api/heatMap/';
//     const queryParams = new URLSearchParams(formData).toString();

//     fetch(apiUrl + '?' + queryParams)
//       .then((response) => response.json())
//       .then((data) => {
//         const polygonsArray = data.prediction.map((zoneData) => {
//             const latLngs = zoneData.coordinates.map((coordinate) => ({
//                 lat: coordinate[0],
//                 lng: coordinate[1],
//               }));
//             const prediction = zoneData.prediction;
//             const color = getColorBasedOnPrediction(prediction);
//             const zoneNumber = zoneData.zoneNumber;
//             return { zoneNumber,latLngs, color, prediction  };
//           });
//         //   setPolygons(polygonsArray); // Update the polygons state with the fetched data
//           onHeatmapDataReceived(polygonsArray);// You can pass the polygons to the parent if needed.
//       })
//       .catch((error) => {
//         console.error('Error:', error);
//       });
//   };


//   const getColorBasedOnPrediction = (prediction) => {
//     if (prediction === -1.5) {
//       return 'rgba(220, 218, 216, 0)'; // Weight 0: Transparent
//     } else if (prediction <= -1) {
//       return 'rgba(180, 223, 187, 1)'; // Weight 1-60: Light green
//     } else if (prediction <= -0.5) {
//       return 'rgba(216, 209, 224, 1)'; // Weight 61-150: Light purple
//     } else if (prediction <= 0) {
//       return 'rgba(246, 244, 198, 1)'; // Weight 151-300: Light yellow
//     } else if (prediction <= 0.5) {
//       return 'rgba(246, 217, 190, 1)'; // Weight 301-450: Light orange
//     } else if (prediction <= 1) {
//       return 'rgba(158, 185, 215, 1)'; // Weight 451-600: Light blue
//     } else {
//       return 'rgba(253, 136, 194, 1)'; // Weight > 600: Light pink
//     }
//   };
  
   

//   return (
//     <div style={{ marginTop: '20px',clor:"#1C2541"}}>
//       <LocalizationProvider dateAdapter={AdapterDayjs} >
//         <DateTimePicker
//           label="Select month,day,hour"
//           value={selectedDate}
//           onChange={handleDateChange}
//           renderInput={(params) => <TextField {...params} />}
//           ampm={false} // Use 24-hour format
//           minutes={false} // Hide the minutes component
//           seconds={false} // Hide the seconds component
          
//         />
//       </LocalizationProvider>
//       <Button
//               variant="contained"
//               size="media"
//               onClick={handleSubmit}
//               style={{ marginTop: '20px',backgroundColor: '#E0d5ec', color: '#ffffff' ,fontWeight: 'bold'}}
//             >
//             {heatmapVisible ? 'Hide Heatmap' : 'Predict Busyness'}
//         </Button>
        
 
//     </div>
//   );
// };

// export default Heatmap;
import React, { useState, useEffect } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import TextField from '@mui/material/TextField';
import { Button, Alert, IconButton, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


const Heatmap = ({ onHeatmapDataReceived, heatmapVisible, onToggleHeatmap, polygons }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [lastSelectedDate, setLastSelectedDate] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSubmit = () => {
    if (!selectedDate) {
      setShowAlert(true);
      return;
    }

    if (selectedDate !== lastSelectedDate) {
      // Fetch heatmap data for the selected date
      fetchHeatmapData(selectedDate);

      // Update the last selected date
      setLastSelectedDate(selectedDate);
    }

    // Toggle heatmap visibility
    onToggleHeatmap();
  };

  useEffect(() => {
    if (!heatmapVisible) {
      setLastSelectedDate(null);
    }
  }, [heatmapVisible]);

  const fetchHeatmapData = (selectedDate) => {
    // Format the selected date to match the API's query string format
    const formData = {
      hour: selectedDate.format("H"), // Get the hour in 24-hour format
      day: selectedDate.date(),
      month: selectedDate.month() + 1,
    };

    const apiUrl = 'http://127.0.0.1:8000/api/heatMap/';
    const queryParams = new URLSearchParams(formData).toString();

    fetch(apiUrl + '?' + queryParams)
      .then((response) => response.json())
      .then((data) => {
        const polygonsArray = data.heat_map.map((zoneData) => {
            const latLngs = zoneData.coordinates.map((coordinate) => ({
                lat: coordinate[0],
                lng: coordinate[1],
              }));
            const prediction = zoneData.prediction;
            const color = getColorBasedOnPrediction(prediction);
            const zoneNumber = zoneData.zoneNumber;
            return { zoneNumber,latLngs, color, prediction  };
          });
        //   setPolygons(polygonsArray); // Update the polygons state with the fetched data
          onHeatmapDataReceived(polygonsArray);// You can pass the polygons to the parent if needed.
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };


  const getColorBasedOnPrediction = (prediction) => {
    if (prediction === 1) {
      return '#ffffff'; // Weight 0: Transparent
    } else if (prediction <= 2) {
      return 'rgba(180, 223, 187, 1)'; // Weight 1-60: Light green
    } else if (prediction <= 3) {
      return 'rgba(216, 209, 224, 1)'; // Weight 61-150: Light purple
    } else if (prediction <= 4) {
      return 'rgba(246, 244, 198, 1)'; // Weight 151-300: Light yellow
    } else if (prediction <=6) {
      return 'rgba(246, 217, 190, 1)'; // Weight 301-450: Light orange
    } else if (prediction <= 8) {
      return 'rgba(158, 185, 215, 1)'; // Weight 451-600: Light blue
    } else {
      return 'rgba(253, 136, 194, 1)'; // Weight > 600: Light pink
    }
  };

  return (
    <div style={{ marginTop: '20px', clor: '#1C2541' }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* Conditionally render the appropriate DateTimePicker */}
        {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? (
          // Render MobileDateTimePicker for mobile devices
          <DateTimePicker
            label="Select month, day, hour"
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(props) => <TextField {...props} />}
            ampm={false}
            minutes={false}
            seconds={false}
          />
        ) : (
          // Render DesktopDateTimePicker for desktop devices
          <DateTimePicker
            label="Select month, day, hour"
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(props) => <TextField {...props} />}
            ampm={false}
            minutes={false}
            seconds={false}
          />
        )}
      </LocalizationProvider>
      <Button
        variant="contained"
        size="media"
        onClick={handleSubmit}
        onTouchStart={handleSubmit}
        style={{ marginTop: '20px', backgroundColor: '#E0d5ec', color: '#ffffff', fontWeight: 'bold' }}
      >
        {heatmapVisible ? 'Lighten Heatmap' : 'Predict Busyness'}
      </Button>

      <Collapse in={showAlert}>
        <Alert
        severity="warning"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setShowAlert(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          Please select date and time.
        </Alert>
      </Collapse>
    </div>
  );
};

export default Heatmap;
