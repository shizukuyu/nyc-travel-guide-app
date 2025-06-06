/* eslint-disable no-unused-vars */
import React, { useMemo, useEffect, useState, useRef,useCallback } from 'react';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';

import { GoogleMap, Marker, InfoWindow,Polygon} from "@react-google-maps/api";
import { DirectionsRenderer } from "@react-google-maps/api";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { Dialog, DialogTitle, DialogContent,Paper,Button} from '@mui/material';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';

import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Import the styles
import 'react-date-range/dist/theme/default.css'; // Import the theme

import './MapPage.css';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Draggable from 'react-draggable';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material'; 
import Heatmap from './Heatmap'; 
import ThreeD from './ThreeD.js';
import ColorLegend from './ColorLegend.js';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { useLocation } from 'react-router-dom';
import TextField from '@mui/material/TextField';

import Autocomplete from '@mui/material/Autocomplete';


const handleDragStart = (event, name, section) => {
  event.dataTransfer.setData('text/plain', JSON.stringify({ name, section }));
};




function DateRangePickerComponent({ handleSelect }) {
  const [selectedRange, setSelectedRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  });
 
  

  const handleChange = (ranges) => {
    setSelectedRange(ranges.selection);
    handleSelect(ranges.selection);
  };

  return (
    <div style={{ width: '100px' }}>
      <DateRangePicker
        ranges={[selectedRange]}
        onChange={handleChange}
      />
    </div>
  );
}

function DateRangePickerDialog({ handleSelect }) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };


  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>   
       <Button
              variant="outlined"
              size="media"
              onClick={handleOpen}
              startIcon={<CalendarMonthIcon />}
              style={{
                margin: '10px',
                backgroundColor: '#1C2541',
                color: '#ffffff',
                fontWeight: 'bold',
                borderColor: '#ffffff',
              }}
            >
              Date Range Picker
            </Button>
            {/* <Divider style={{border: '1px solid white',marginTop:"6px"}} /> */}
    
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent>
          <Paper sx={{ width: '600px' }}>
            <DateRangePickerComponent handleSelect={handleSelect} />
          </Paper>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TemporaryDrawer({tmp}) {
  // const [isDrawerOpen, setDrawerOpen] = useState(true);
  const [isWindowOpen, setWindowOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const allowDrop = (event) => {
    event.preventDefault();
  };
  
  const handleDrop = (event,  sectionName) => {
    event.preventDefault();
    event.stopPropagation();
    const placeData = JSON.parse(event.dataTransfer.getData('text/plain'));
   

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.justifyContent = 'space-between'; 
    container.style.border = '1px dashed #1C2541';
    container.style.borderRadius = '10px';
    container.style.padding = '5px';

    container.style.marginBottom = '5px';
    container.style.marginTop = '5px';
    container.className = 'dropped-section-container';

    const contentElement = document.createElement('span');
    contentElement.textContent = `${placeData.name} `;
    contentElement.style.flex = '1'; 

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<DeleteIcon style="font-size: 13px;" />Delete';
    deleteButton.style.backgroundColor = '#1C2541';
    deleteButton.style.color = '#ffffff';
    deleteButton.style.fontWeight= 'bold';
    deleteButton.style.border = 'none';
    deleteButton.style.borderRadius = '5px';
    deleteButton.style.padding = '8px';
    deleteButton.style.cursor = 'pointer';
    deleteButton.onclick = (event) => handleDelete(event, container);

    container.appendChild(contentElement);
    container.appendChild(deleteButton);

    event.target.appendChild(container);
  };

  const handleDelete = (event, container) => {
    event.preventDefault();
    event.stopPropagation();
    container.remove();
  };
  const handleDragOver = (event) => {
    event.preventDefault();
  };
  

  const toggleWindow = () => {
    setWindowOpen(!isWindowOpen);
  };

  const handleSelectRange = (range) => {
    setSelectedRange(range);
  };
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  const handleMarkerSelection = async (place, sectionName) => {
    await setSelectedPlaces((prevSelectedPlaces) => [...prevSelectedPlaces, { ...place, section: sectionName }]);
    tmp([...selectedPlaces, { ...place, section: sectionName }]);
  };

  const renderDateRangeContent = () => {
    if (selectedRange) {
      const { startDate, endDate } = selectedRange;
      const start = startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const end = endDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      

      const dateContent = [];
      for (let i = 0; i <=days; i++) {
        const currentDate = new Date(startDate.getTime() + i * (1000 * 60 * 60 * 24));
        const dayString = currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        dateContent.push(
          <div key={i} className="day-container" onDrop={(event) => handleDrop(event, currentDate)} onDragOver={allowDrop}>
            <h4>{dayString}</h4>
            <div
            
            onDrop={(event) => handleDrop(event, currentDate)}
            className="drop-section"
            onDragOver={handleDragOver}
            style={{ background: "#ffffff", padding: "10px", marginTop: "10px",color:"#1C2541" ,border:"1px solid #1C2541"}}
          >
            <PostAddIcon  sx={{ fontSize: 18,}}/>
            Drag a place here to add it
          </div>
          </div>
        );
      }

      return (
        <>
          <h3>{`${start} - ${end}`}</h3>
          {dateContent}
        </>
      );
    }

    return null;
  };

  return (
    <div  style={{  width:'100%',overflow: 'auto'}}>
     
        <div style={{ display: 'flex'}}>
          <div style={{background: 'white',height:'60vh', width: '100%', overflow: 'auto'}}>
            <h2>New York Trip</h2>
            <Divider />
            <Button
              variant="outlined"
              size="media"
              onClick={toggleWindow}
              endIcon={<OpenInNewIcon  sx={{ fontSize: 28,}}/>}
              style={{ margin: '10px',backgroundColor: '#1C2541', color: '#ffffff',fontWeight: 'bold' }}
            >
              Open Day Planner
            </Button>
            <Divider />
            <CustomizedAccordions onMarkerSelect={handleMarkerSelection} />
           
           
          </div>
          {isWindowOpen && (
            <div
              style={{
                width: '90%',
                // border: '1px solid #1C2541',
                background: '#1C2541',
                color:"#ffffff",
              }}
            >
             <h2> Itinerary</h2>
              <DateRangePickerDialog handleSelect={handleSelectRange} />
              <div  style={{ maxHeight: '45vh', overflow: 'auto' }}>{renderDateRangeContent()}</div>
            </div>
          )}
        </div>
     
    </div>
  );
}



  const Accordion = styled((props) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
  ))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
  }));
  
  const AccordionSummary = styled((props) => (
    <MuiAccordionSummary {...props} />
  ))(({ theme }) => ({
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, .05)'
        : 'rgba(28, 37, 65, 0.01)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
      marginLeft: theme.spacing(1),
    },
  }));
  
  const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .105)',
  }));

 
  function CustomizedAccordions({ onMarkerSelect }) {
    const [expanded, setExpanded] = useState('attractions');
    const [attractions, setAttractions] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [, setRestaurants] = useState([]);
    const [, setHotels] = useState([]); 
    const [attractionValue, setAttractionValue] = useState('');
    const [restaurantValue, setRestaurantValue] = useState('');
    const [hotelValue, setHotelValue] = useState(''); 

    const [selectedAttractions, setSelectedAttractions] = useState([]);
    const [selectedRestaurants, setSelectedRestaurants] = useState([]);
    const [selectedHotels, setSelectedHotels] = useState([]); 
    const [attractionsChecked, setAttractionsChecked] = useState(false);
    const [restaurantsChecked, setRestaurantsChecked] = useState(false);
    const [hotelsChecked, setHotelsChecked] = useState(false); 

    const [attractionSuggestions, setAttractionSuggestions] = useState([]);
    const [restaurantSuggestions, setRestaurantSuggestions] = useState([]);
    const [hotelSuggestions, setHotelSuggestions] = useState([]);

    
    useEffect(() => {
      fetch('http://127.0.0.1:8000/api/googleAttractions/')
        .then((response) => response.json())
        .then((data) => {
          setAttractions(data);
          setAttractionSuggestions(data);
        })
        .catch((error) => console.error(error));
    
      fetch('http://127.0.0.1:8000/api/googleRestaurants/')
        .then((response) => response.json())
        .then((data) => {
          setRestaurants(data);
          setRestaurantSuggestions(data);
        })
        .catch((error) => console.error(error));
    
      fetch('http://127.0.0.1:8000/api/googleHotels/')
        .then((response) => response.json())
        .then((data) => {
          setHotels(data);
          setHotelSuggestions(data);
        })
        .catch((error) => console.error(error));
    }, []);
    
    


    
  
    const handleChange = (panel) => (event, newExpanded) => {
      if (panel === 'attractions') {
        setAttractionsChecked(newExpanded);
      } else if (panel === 'restaurants') {
        setRestaurantsChecked(newExpanded);
      } else if (panel === 'hotels') { // New handler for hotels
        setHotelsChecked(newExpanded);
      }
      setExpanded(newExpanded ? panel : false);
    };

    
    const handleInputChange = useCallback((section) => (event, newValue) => {
      if (section === 'attractions') {
        setAttractionValue(newValue);
  
        if (!newValue) {
          setAttractionSuggestions([]);
        }
      } else if (section === 'restaurants') {
        setRestaurantValue(newValue);
  
        if (!newValue) {
          setRestaurantSuggestions([]);
        }
      } else if (section === 'hotels') {
        setHotelValue(newValue);
  
        if (!newValue) {
          setHotelSuggestions([]);
        }
      }
    }, []);

    const [, setSelectedSuggestion] = useState(null);

  

    const handleSelectSuggestion = useCallback((suggestion, section) => {
      if (suggestion && suggestion.name) {
        if (section === 'attractions') {
          const isAlreadySelected = selectedAttractions.some(
            (attraction) => attraction.name === suggestion.name
          );
          if (!isAlreadySelected) {
            setSelectedAttractions((prevAttractions) => [...prevAttractions, suggestion]);
            setAttractionValue('');
            onMarkerSelect(suggestion);
          }
        } else if (section === 'restaurants') {
          const isAlreadySelected = selectedRestaurants.some(
            (restaurant) => restaurant.name === suggestion.name
          );
          if (!isAlreadySelected) {
            setSelectedRestaurants((prevRestaurants) => [...prevRestaurants, suggestion]);
            setRestaurantValue('');
            onMarkerSelect(suggestion);
          }
        } else if (section === 'hotels') {
          const isAlreadySelected = selectedHotels.some((hotel) => hotel.name === suggestion.name);
          if (!isAlreadySelected) {
            setSelectedHotels((prevHotels) => [...prevHotels, suggestion]);
            setHotelValue('');
            onMarkerSelect(suggestion);
          }
        }
      }
       setSelectedSuggestion(suggestion);
    }, [onMarkerSelect, selectedAttractions, selectedRestaurants, selectedHotels]);
    
  
    const handleRemoveAttraction = (index) => {
      setSelectedAttractions((prevAttractions) => prevAttractions.filter((_, i) => i !== index));
    };
  
    const handleRemoveRestaurant = (index) => {
      setSelectedRestaurants((prevRestaurants) => prevRestaurants.filter((_, i) => i !== index));
    };
    const handleRemoveHotel = (index) => { // New handler for removing hotels
      setSelectedHotels((prevHotels) => prevHotels.filter((_, i) => i !== index));
    };
  
  
    const attractionInputProps = {
      placeholder: 'Search attractions',
      value: attractionValue,
      onChange: handleInputChange('attractions'),
    };
  
    const restaurantInputProps = {
      placeholder: 'Search restaurants',
      value: restaurantValue,
      onChange: handleInputChange('restaurants'),
    };

    

    const hotelInputProps = { // New input props for hotel
      placeholder: 'Search hotels',
      value: hotelValue,
      onChange: handleInputChange('hotels'),
    };
    const getOpeningHoursForToday = (attraction) => {
      const today = new Date().getDay();
      if (
        attraction.opening_hours &&
        attraction.opening_hours.opening_hours &&
        attraction.opening_hours.opening_hours.periods
      ) {
        const openingHoursForToday = attraction.opening_hours.opening_hours.periods.find(
          (period) => period.open.day === today
        );
        return openingHoursForToday;
      }
      return null;
    };
  
    const formatTime = (time) => {
      const hours = parseInt(time.slice(0, 2), 10);
      const minutes = time.slice(2);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes} ${ampm}`;
    };




  
    return (
      <div>
        <Accordion expanded={expanded === 'attractions'} onChange={handleChange('attractions')}>
            <AccordionSummary
              aria-controls="attractions-content"
              id="attractions-header"
              expandIcon={
                <Checkbox
                  color="primary"
                  inputProps={{ 'aria-label': 'checkbox' }}
                  checked={attractionsChecked}
                />
              }
            >
              <Typography style={{fontSize:"18px",color:"#1C2541",fontFamily:"sans-serif",fontWeight:"bold"}}>Attractions</Typography>
              <div
                className="label-circle"
                style={{ backgroundColor: attractionsChecked ? '#fdffb6' : 'transparent' }}
              ></div>
            </AccordionSummary>

          <AccordionDetails>
          <Autocomplete
  options={attractionSuggestions}
  getOptionLabel={(option) => option.name}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Search attractions"
      variant="outlined"
    />
  )}
  onChange={(_, newValue) => {
    handleSelectSuggestion(newValue, 'attractions');
  }}
  
/>
          </AccordionDetails>
        </Accordion>
        <div 
       
        >
          {selectedAttractions.map((attraction, index) => (
             <div key={`attraction-${index}`} className="attraction-item"
          
            
             onDragStart={(event) => handleDragStart(event, attraction.name, attractions)}
             draggable>
              <div className="attraction-name">{attraction.name} Rating:{attraction.rating}</div>
              {/* <div>Rating: {attraction.rating}</div> */}
              <div className="photo-container">
                <img src={attraction.photos[0]} alt={attraction.name} className="attraction-photo" />
                </div>
                <div className="opening-hours">
                  {attraction.opening_hours?.opening_hours ? (
                    <>
                      <h4 style={{color:"#1C2541",fontWeight: 'bold',margin:"5px"}}>Opening Hours Today:</h4>
                      {getOpeningHoursForToday(attraction) ? (
                        <div>
                          {formatTime(getOpeningHoursForToday(attraction).open.time)} –{' '}
                          {formatTime(getOpeningHoursForToday(attraction).close.time)}
                        </div>
                      ) : (
                        <div>No opening hours information available for today.</div>
                      )}
                      {attraction.opening_hours?.opening_hours.open_now !== undefined ? (
                        <div>
                          {attraction.opening_hours.open_now ? 'Currently Open' : 'Currently Closed'}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div>No opening hours information available.</div>
                  )}
                </div>
                <div>
                <Button
                variant="text"
                  size="small"
                  onClick={() => handleRemoveAttraction(index)}
                  startIcon={<DeleteIcon />}
                  style={{ margin: '10px', color: '#1C2541',fontWeight: 'bold' }}
                >
              Remove
              </Button>
              </div>
            </div>
          ))}
        </div>
        <Accordion expanded={expanded === 'restaurants'} onChange={handleChange('restaurants')}>
          <AccordionSummary
            aria-controls="restaurants-content"
            id="restaurants-header"
            expandIcon={
              <Checkbox
                color="primary"
                inputProps={{ 'aria-label': 'checkbox' }}
                checked={restaurantsChecked}
              />
            }
            >
            <Typography style={{fontSize:"18px",color:"#1C2541",fontFamily:"sans-serif",fontWeight:"bold"}}>Restaurants</Typography>
            <div
              className="label-circle"
              style={{ backgroundColor: restaurantsChecked ? '#06d6a0' : 'transparent' }}
            ></div>
          </AccordionSummary>
          <AccordionDetails>
          <Autocomplete
  options={restaurantSuggestions}
  getOptionLabel={(option) => option.name}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Search restaurants"
      variant="outlined"
      {...restaurantInputProps}
    />
  )}
  onChange={(_, newValue) => {
    handleSelectSuggestion(newValue, 'restaurants');
  }}
/>

          </AccordionDetails>
        </Accordion>
        <div
       
        >
          {selectedRestaurants.map((restaurant, index) => (
            <div key={`restaurant-${index}`} className="restaurant-item"
           
           
            onDragStart={(event) => handleDragStart(event, restaurant.name)}
            draggable>
              <div className="restaurant-name">{restaurant.name}</div>
              <div>Rating: {restaurant.rating}</div>
              <div className="photo-container">
                <img src={restaurant.photos[0]} alt={restaurant.name} className="restaurant-photo" />
                </div>
                <div className="opening-hours">
                  {restaurant.opening_hours?.opening_hours ? (
                    <>
                       <h4 style={{color:"#1C2541",fontWeight: 'bold',margin:"5px"}}>Opening Hours Today:</h4>
                      {getOpeningHoursForToday(restaurant) ? (
                        <div>
                          {formatTime(getOpeningHoursForToday(restaurant).open.time)} –{' '}
                          {formatTime(getOpeningHoursForToday(restaurant).close.time)}
                        </div>
                      ) : (
                        <div>No opening hours information available for today.</div>
                      )}
                      {restaurant.opening_hours?.opening_hours.open_now !== undefined ? (
                        <div>
                          {restaurant.opening_hours.open_now ? 'Currently Open' : 'Currently Closed'}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div>No opening hours information available.</div>
                  )}
                </div>
                <div>
                <Button
                variant="text"
                  size="small"
                  onClick={() => handleRemoveRestaurant(index)}
                  startIcon={<DeleteIcon />}
                  style={{ margin: '10px', color: '#1C2541',fontWeight: 'bold' }}
                >
              Remove
              </Button>
                </div>
            </div>
          ))}
        </div>
        <Accordion expanded={expanded === 'hotels'} onChange={handleChange('hotels')}>
        <AccordionSummary
          aria-controls="hotels-content"
          id="hotels-header"
          expandIcon={
            <Checkbox
              color="primary"
              inputProps={{ 'aria-label': 'checkbox' }}
              checked={hotelsChecked}
            />
          }
        >
          <Typography style={{fontSize:"18px",color:"#1C2541",fontFamily:"sans-serif",fontWeight:"bold"}}>Hotels</Typography>
          <div
            className="label-circle"
            style={{ backgroundColor: hotelsChecked ? '#ff6b35' : 'transparent' }}
          ></div>
        </AccordionSummary>
        <AccordionDetails>
        <Autocomplete
  options={hotelSuggestions}
  getOptionLabel={(option) => option.name}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Search hotels"
      variant="outlined"
      {...hotelInputProps}
    />
  )}
  onChange={(_, newValue) => {
    handleSelectSuggestion(newValue, 'hotels');
  }}
/>

        </AccordionDetails>
      </Accordion>
      <div
    
      >
        {selectedHotels.map((hotel, index) => (
       <div key={`hotel-${index}`} className="hotel-item"
      
       onDragStart={(event) => handleDragStart(event, hotel.name)}
       draggable>
            <div className="hotel-name">{hotel.name}</div>
            <div>Rating: {hotel.rating}</div>
            <div className="photo-container">
              <img src={hotel.photos[0]} alt={hotel.name} className="hotel-photo" />
            </div>
            <div>
            <Button
                variant="text"
                  size="small"
                  onClick={() => handleRemoveHotel(index)}
                  startIcon={<DeleteIcon />}
                  style={{ margin: '10px', color: '#1C2541',fontWeight: 'bold' }}
                >
              Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
      </div>
    );
  }
  

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha('#1a659e', 0.05),
  '&:hover': {
    backgroundColor: alpha('#1a659e', 0.15),
  },
  marginLeft: 0,
  marginTop: 10,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: '#1a659e',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 2),
    paddingLeft: theme.spacing(6),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '30ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const searchOptions = {
  componentRestrictions: { country: ['us'] }
}

function LocationSearchInput({ placeholder, value, onChange }) {
  return (
    <PlacesAutocomplete
      searchOptions={searchOptions}
      value={value}
      onChange={onChange}
      options={{}}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            {...getInputProps({
              placeholder: placeholder,
              className: 'location-search-input',
            })}
            inputProps={{ 'aria-label': 'search' }}
            style={{width: "100%",Maxwidth:" 100px"}}
          />
          <div className="autocomplete-dropdown-container">
            {loading && <div>Loading...</div>}
            {suggestions.map((suggestion, index) => {
              return (
                <div key={index} {...getSuggestionItemProps(suggestion)}>
                  <span>{suggestion.description}</span>
                </div>
              );
            })}
          </div>
        </Search>
      )}
    </PlacesAutocomplete>
  );
}


function MapPage() {

  // const { isLoaded } = useJsApiLoader({
  //   id: 'google-map-script',
  //   googleMapsApiKey: MAPS_API_KEY,
  //   libraries: libraries,
  // });

  const center = useMemo(() => ({ lat:40.7422, lng: - 73.9880 }), []);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [directions, setDirections] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [showMarkers, setShowMarkers] = useState(true);
  const [, setDistance] = useState('');
  const [, setDuration] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState([]);
  const [showAttractions, setShowAttractions] = useState(false);
  const [showRestaurants, setShowRestaurants] = useState(false);
  const [showHotels, setShowHotels] = useState(false);
  const [manuallyAddedMarkers, setManuallyAddedMarkers] = useState([]);
  const draggableRef = useRef(null);
  const [nightMode, setNightMode] = useState(false);


  const location = useLocation();
  const initialMarkerPosition = location.state?.location;
  


  useEffect(() => {

    // Only set the markers when initialMarkerPosition is available and markers is empty
    if (initialMarkerPosition && markers.length >= 180) {
      setMarkers([
        {
          id: 1,
          position: { lat: parseFloat(initialMarkerPosition.lat), lng: parseFloat(initialMarkerPosition.lng) },
          title:initialMarkerPosition.title,
        },
      ]);
      setShowMarkers(true);
    }
  }, [initialMarkerPosition, markers]);

  const handleMapToggle = () => {
    setNightMode((prevNightMode) => !prevNightMode);
  };


  const handleMarkerSelection = (place) => {
    setSelectedPlace((prevSelectedPlaces) => [...prevSelectedPlaces, place]);
  
  };

  const tmp = (place) => {
    setSelectedPlace(place);
  }



  useEffect(() => {
    // Add markers on Google Map when selectedPlace changes
    if (selectedPlace && selectedPlace.length > 0) {
      const newMarkers = selectedPlace.map((place) => ({
        id: place.place_id,
        position: {
          lat: Number(place.latitude),
          lng: Number(place.longitude),
        },
        title: place.name,
        info: {
          address: place.address,
          rating: place.rating,
          photos: place.photos,
        },
        animation: window.google.maps.Animation.DROP,
        options: {
          icon: {
            path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
            fillColor: "#1a659e",
            fillOpacity: 1,
            strokeWeight: 0,
            rotation: 0,
            scale: 2,
            anchor: new window.google.maps.Point(0, 20),
           
          },
        },
      }));
  
      setMarkers((prevMarkers) => {
        // Remove markers with duplicate ids
        const updatedMarkers = prevMarkers.filter((marker) =>
          newMarkers.every((newMarker) => newMarker.id !== marker.id)
        );
        return [...updatedMarkers, ...newMarkers];
      });
    }
  }, [selectedPlace]);
  

  

  useEffect(() => {
    setSelectedPlace(selectedPlace);
  }, [selectedPlace]);

  useEffect(() => {
    // Fetch weather data from the API
    fetch('http://127.0.0.1:8000/api/weather/')
      .then((response) => response.json())
      .then((data) => setWeatherData(data))
      .catch((error) => console.error(error));
  }, []);



  useEffect(() => {
    // if (isLoaded) {
      Promise.all([
        fetch('http://127.0.0.1:8000/api/googleAttractions/')
          .then((response) => response.json()),
        fetch('http://127.0.0.1:8000/api/googleHotels')
          .then((response) => response.json()),
        fetch('http://127.0.0.1:8000/api/googleRestaurants/')
          .then((response) => response.json())
      ])
        .then(([attractionsData, hotelsData, restaurantsData]) => {
          const attractionsMarkers = attractionsData.map((attraction) => ({
            id: attraction.place_id,
            position: {
              lat: attraction.latitude,
              lng: attraction.longitude,
            },
            title: attraction.name,
            type: 'googleAttractions',
            info: {
              address: attraction.address,
              rating: attraction.rating,
              photos: attraction.photos,
              open: attraction.opening_hours?.opening_hours?.periods[0]?.open?.time || '', 
              close: attraction.opening_hours?.opening_hours?.periods[0]?.close?.time || '',
            },
            options: {
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: '#efefd0',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 1,
                scale: 8,
              },
            },
          }));
  
          const hotelsMarkers = hotelsData.map((hotel) => ({
            id: hotel.place_id,
            position: {
              lat: hotel.latitude,
              lng: hotel.longitude,
            },
            title: hotel.name,
            type: 'googleHotels',
            info: {
              address: hotel.address,
              rating: hotel.rating,
              photos: hotel.photos,
            },
            options: {
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: '#ff6b35',
                fillOpacity: 0.7,
                strokeColor: 'white',
                strokeWeight: 1,
                scale: 8,
              },
            },
          }));
  
          const restaurantsMarkers = restaurantsData.map((restaurant) => ({
            id: restaurant.place_id,
            position: {
              lat: restaurant.latitude,
              lng: restaurant.longitude,
            },
            title: restaurant.name,
            type: 'googleRestaurants',
            info: {
              address: restaurant.address,
              rating: restaurant.rating,
              photos: restaurant.photos,
              open: restaurant.opening_hours?.opening_hours?.periods[0]?.open?.time || '', 
              close: restaurant.opening_hours?.opening_hours?.periods[0]?.close?.time || '',
            },
            options: {
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: '#06d6a0',
                fillOpacity: 0.6,
                strokeColor: 'white',
                strokeWeight: 1,
                scale: 8,
              },
            },
          }));
  
          const newMarkers = [...attractionsMarkers, ...hotelsMarkers, ...restaurantsMarkers];
          setMarkers(newMarkers);
        })
        .catch((error) => {
          console.error(error);
          setMarkers([]);
        });
    // }
  }, []);
  
  const getImageUrl = (weatherType) => {
    if (weatherType === 'Thunderstorm') {
      return 'https://openweathermap.org/img/wn/11d@2x.png';
    } else if (weatherType === 'Drizzle') {
      return 'https://openweathermap.org/img/wn/09d@2x.png';
    } else if (weatherType === 'Rain') {
      return 'https://openweathermap.org/img/wn/10d@2x.png';
    } else if (weatherType === 'Snow') {
      return 'https://openweathermap.org/img/wn/13d@2x.png';
    } else if (weatherType === 'Clear') {
      return 'https://openweathermap.org/img/wn/01d@2x.png';
    } else if (weatherType === 'Clouds') {
      return 'https://openweathermap.org/img/wn/02d@2x.png';
    } else {
      return 'https://openweathermap.org/img/wn/50d@2x.png';
    }
  };


  const formattedDate = weatherData
  ? new Date(weatherData.timestamp * 1000).toLocaleString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    })
  : '';

  useEffect(() => {
    if (originInput) {
      const handleSelect = async (value) => {
        try {
          const results = await geocodeByAddress(value, {
            circle: {
              lat: center.lat,
              lng: center.lng,
              radius: 40000, // 40 km radius
            },
          });
          const latLng = await getLatLng(results[0]);
          setOrigin(latLng);
        } catch (error) {
          console.log(error);
        }
      };

      handleSelect(originInput);
    }
  }, [center.lat, center.lng, originInput]);

  useEffect(() => {
    if (destinationInput) {
      const handleSelect = async (value) => {
        try {
          const results = await geocodeByAddress(value, {
            circle: {
              lat: center.lat,
              lng: center.lng,
              radius: 40000, // 40 km radius
            },
          });
          const latLng = await getLatLng(results[0]);
          setDestination(latLng);
        } catch (error) {
          console.log(error);
        }
      };

      handleSelect(destinationInput);
    }
  }, [center.lat, center.lng, destinationInput]);



 
  const handleMarkerClick = (marker) => {
    if (origin === null) {
      setOrigin(marker.position);
    } else {
      setDestination(marker.position);
    }
    setSelectedMarker(marker);
    
    setZoomLevel(15);
    
  };


  
  const handleSearch = () => {
    if (origin && destination) {
      // Clear the previous directions before performing a new search
      setDirections(null);
  
      // Perform routing using DirectionsService
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: modeOfTransport, // Use the selected mode of transport
        },
        (response, status) => {
          if (status === 'OK') {
            // Set the directions in the state
            setDirections(response);
            const leg = response.routes[0]?.legs[0];
            if (leg) {
              setDistance(leg.distance?.text || '');
              setDuration(leg.duration?.text || '');
            } else {
              setDistance('');
              setDuration('');
            }
          } else {
            console.error('Error:', status);
          }
        }
      );
    }
  };
  

  const handleToggleMarkers = () => {
    setShowMarkers((prevShowMarkers) => !prevShowMarkers);
    setShowAttractions(false);
    setShowRestaurants(false);
    setShowHotels(false);
    // If markers are hidden, reset the manuallyAddedMarkers to an empty array
  if (!showMarkers) {
    setManuallyAddedMarkers([]);
  } else {
    // If markers are shown, add the manually added markers to the state
    setMarkers((prevMarkers) => [...prevMarkers, ...manuallyAddedMarkers]);
  }
  };
  
  const [modeOfTransport, setModeOfTransport] = useState('DRIVING');

  const handleModeOfTransportChange = (event) => {
    setModeOfTransport(event.target.value);
  };

  const distanceText = directions?.routes[0]?.legs[0]?.distance?.text || '';
  const durationText = directions?.routes[0]?.legs[0]?.duration?.text || '';

  const [polygons, setPolygons] = useState([]);


  const handleHeatmapDataReceived = (data) => {
  
    setPolygons(data);
  };
  const mapRef = useRef(null)
  

  const [heatmapVisible, setHeatmapVisible] = useState(false);

  const handleToggleHeatmap = () => {
    setHeatmapVisible((prevHeatmapVisible) => !prevHeatmapVisible);
   
  };

  const [predictionNumber, setPredictionNumber] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleMapMouseOver = useCallback((event) => {
    const latLng = event.latLng;
    let prediction = null;

    // Find the polygon that contains the mouse position
    for (const polygonData of polygons) {
      const polygon = new window.google.maps.Polygon({ paths: polygonData.latLngs });
      if (window.google.maps.geometry.poly.containsLocation(latLng, polygon)) {
        prediction = parseInt(polygonData.prediction,10);
        
        break;
      }
    }

    // Update the state with the prediction number
    setPredictionNumber(prediction);
  });
  
 useEffect(() => {
    const map = mapRef.current;
    if (map) {
      map.addListener('mousemove', handleMapMouseOver);
    }

    return () => {
      if (map) {
        map.removeListener('mousemove', handleMapMouseOver);
      }
    };
  }, [handleMapMouseOver]);
  // Function to handle mouseout event on the map
  const handleMapMouseOut = () => {
    setPredictionNumber(null);
  };



  const [zoomLevel, setZoomLevel] = useState(13); // Set an initial zoom level



  const [componentsVisible, setComponentsVisible] = useState(true);

  return (
    
    <div style={{ color: '#1C2541', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className='fixed-box'>
      <Draggable nodeRef={draggableRef}>
      <div id="info01" style={{ cursor: 'move' }} ref={draggableRef}>
        <div className="weather-data">
          {weatherData ? (
            <div>
              <img src={getImageUrl(weatherData.main_weather)} alt={weatherData.main_weather} />
              <div>
              <strong>{formattedDate}: {weatherData.main_weather}, {Math.round(weatherData.temperature - 273.15)}°C</strong>
            </div></div>
          ) : (
            <strong>Loading weather data...</strong>
          )}
        </div>
    
          <Heatmap
        onHeatmapDataReceived={handleHeatmapDataReceived}
        heatmapVisible={heatmapVisible}
        onToggleHeatmap={handleToggleHeatmap}
      
      />
  
        <div style={{margin: '16px 34px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridGap: '6px' }}>
        <Button
       variant="contained"
        size="small"
        onClick={handleToggleMarkers}
        onTouchStart={handleToggleMarkers}
        style={{ margin: '2px',backgroundColor: '#1a659e', color: '#ffffff' ,fontWeight: 'bold'}}
      >
        {showMarkers ? 'Show Select Plan' : 'Hide Select Plan'}
        </Button>

        <Button
            variant="contained"
            size="small"
            onClick={() => setShowHotels(!showHotels)}
            onTouchStart={() => setShowHotels(!showHotels)}
            style={{ margin: '2px' ,backgroundColor: '#ff6b35', color: '#ffffff' ,fontWeight: 'bold'}}
          >
            {showHotels ? 'Show All Hotels' : 'Hide All Hotels'}
           
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => setShowAttractions(!showAttractions)}
            onTouchStart={() => setShowAttractions(!showAttractions)}
            style={{ margin: '2px',backgroundColor: '#efefd0', color: '#ffffff' ,fontWeight: 'bold'}}
          >
             {showAttractions ? 'Show All Attractions' : 'Hide All Attractions'}
          </Button>
          <Button
            variant="contained"
            size="small"
            onTouchStart={() => setShowRestaurants(!showRestaurants)}
            onClick={() => setShowRestaurants(!showRestaurants)}
            style={{ margin: '2px',backgroundColor: '#06d6a0', color: '#ffffff',fontWeight: 'bold' }}
          >
              {showRestaurants ? 'Show All Restaurants' : 'Hide All Restaurants'}
             
          </Button>
         
          </div>

          <div style={{ maxWidth: "250px" }}>
            <LocationSearchInput
              placeholder="Start point "
              value={originInput}
              onChange={setOriginInput}
              
            />
            <LocationSearchInput
              placeholder="Destination "
              value={destinationInput}
              onChange={setDestinationInput}
            />

            <Button
              variant="contained"
              size="small"
              onClick={handleToggleMarkers}
              onTouchStart ={handleToggleMarkers}
              disabled={!origin || !destination}
              style={{ marginTop: '20px',marginRight:"20px",backgroundColor: '#1a659e', color: '#ffffff' ,fontWeight: 'bold'}}
            >
              Toggle Markers
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleSearch}
              onTouchStart ={handleSearch}
              disabled={!origin || !destination}
              style={{ marginTop: '20px',backgroundColor: '#1a659e', color: '#ffffff',fontWeight: 'bold' }}
            >
              Search
            </Button>
          </div>
          <div style={{ margin: '25px,20px',display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' ,color:"#1C2541"}}>
          <div style={{flex:1,marginRight: '20px'}}>
            <FormControl variant="outlined" style={{marginLeft:"25px",marginTop:"20px",width:"98px" ,height:"60px"} }>
                <InputLabel id="mode-of-transport-label">Transport Mode</InputLabel>
                <Select
                  labelId="mode-of-transport-label"
                  id="mode-of-transport"
                  value={modeOfTransport}
                  onChange={handleModeOfTransportChange}
                  label="Mode of Transport"
                >
                  <MenuItem value="DRIVING">Driving</MenuItem>
                  <MenuItem value="WALKING">Walking</MenuItem>
                  <MenuItem value="BICYCLING">Cycling</MenuItem>
                  <MenuItem value="TRANSIT">Public Transport</MenuItem>
                </Select>
              </FormControl>
              </div>
          {origin && destination && directions && (
            <div style={{marginLeft: '2px', textAlign: 'left',marginTop:"9px" }}>
              <p>Distance: {distanceText}</p>
              <p>Time: {durationText}</p>
            </div>
          )}
        </div>
        </div>
        </Draggable>
      </div>
      <div className='hidebutton'>
       <Draggable nodeRef={draggableRef}>
       <div
       
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#1C2541',
           
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'grab',
            position: 'fixed',
            left: '30%',
            top: '11.5%',
            transform: 'translate(-50%, -50%)',
            zIndex: 999,
          }}
         
        >
          
          <button
            onClick={() => setComponentsVisible(!componentsVisible)}
            className="button-mobile-hidden"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              width: '100%',
              height: '100%',
              fontWeight:'bold',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {componentsVisible ? 'Hide' : 'Show'}
          </button>
        </div>
      </Draggable>
      </div>
      <div style={{ display: 'flex', flex: '1' }} >
      
        {componentsVisible && (
          <div className="mobile-hidden" style={{width:"500px"}}>
          <div style={{ flex: '1.6', display: 'flex', flexDirection: 'column' }}>
            <TemporaryDrawer onMarkerSelect={handleMarkerSelection} tmp={tmp} />
            <div style={{ position: 'relative', height: '32vh', }}>
              <ThreeD handleMapToggle={handleMapToggle} style={{ width: '100%',height:"100%" }} />
            </div>
          </div>
          </div>
        )}
       
        <div style={{ flex: '3', display: 'flex', flexDirection: 'column' }}>
          {/* {!isLoaded ? (
            <div>Loading...</div>
          ) : ( */}
            <GoogleMap
              mapContainerStyle={{ flex: '1', height: '100%' }}
              center={center}
              zoom={zoomLevel} 
              onMouseOver={handleMapMouseOver} 
              onMouseOut={handleMapMouseOut} 
            
              mapId="MAPS_API_KEY"
              options={{
                styles: nightMode?[
                  {
                    featureType: 'all',
                    stylers: [
                      { saturation: -100 }, // Decrease saturation to make colors less vibrant
                      { lightness: -50 }, // Decrease lightness to make colors darker
                    ],
                  },
                  {
                    featureType: 'road',
                    elementType: 'geometry',
                    stylers: [
                      { visibility: 'simplified' }, // Simplify road geometry
                      { lightness: -20 }, // Decrease lightness to make roads darker
                    ],
                  },
                  {
                    featureType: 'poi',
                    stylers: [{ visibility: 'off' }], // Hide points of interest (POIs)
                  },
                  {
                    featureType: 'transit',
                    stylers: [{ visibility: 'off' }], // Hide transit information
                  },
                  {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [
                      { visibility: 'simplified' }, // Simplify water geometry
                      { lightness: -50 }, // Decrease lightness to make water darker
                    ],
                  },
                  {
                    featureType: 'water',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#ffffff' }], // Set water label text color to white
                  },
                ]:
                [
                  {
                    featureType: 'all',
                    stylers: [
                      { saturation: 0 },
                      { hue: '#e3f2fd' },
                    ],
                  },
                  {
                    featureType: 'road',
                    stylers: [{ saturation: -70 }],
                  },
                  {
                    featureType: 'transit',
                    stylers: [{ visibility: 'off' }],
                  },
                  {
                    featureType: 'poi',
                    stylers: [{ visibility: 'off' }],
                  },
                  {
                    featureType: 'water',
                    stylers: [
                      { visibility: 'simplified' },
                      { saturation: -60 },
                    ],
                  },
                ],
              }}
            >
             
             
             {heatmapVisible &&
          polygons.map((polygonData) => (
            <Polygon
              key={polygonData.zoneNumber}
              paths={polygonData.latLngs}
              prediction={polygonData.prediction}
              options={{
                fillColor: polygonData.color,
                fillOpacity: 0.5,
                strokeColor: polygonData.color,
                strokeOpacity: 0.9,
                strokeWeight: 2,
              }}
              onMouseOver={() => setPredictionNumber(polygonData.prediction)} // Add the mouseover event handler for each polygon
              onMouseOut={() => setPredictionNumber(null)} 
            />
          ))}
            {showMarkers && markers
            .filter((marker) => !marker.type) 
            .map((marker) => (
              // Render all markers when showMarkers is true
              <Marker
              key={`marker-${marker.id}`} 
                position={marker.position}
                title={marker.title}
                onClick={() => handleMarkerClick(marker)}
                options={marker.options}
                animation={marker.animation}
                onMouseOver={() => setSelectedMarker(marker)} // Show InfoWindow on hover
                onMouseOut={() => setSelectedMarker(null)} 
                
              >
                {selectedMarker === marker && (
                  <InfoWindow
                    position={selectedMarker.position}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                   <div >
                        <h3>{selectedMarker.title}</h3>
                        {selectedMarker.info && (
                          <div>
                            <p>Address: {selectedMarker.info.address}</p>
                            <p>Rating: {selectedMarker.info.rating}</p>
                            {selectedMarker.info.photos && selectedMarker.info.photos.length > 0 && (
                              <img
                                src={selectedMarker.info.photos[0]}
                                alt={selectedMarker.title}
                              />
                            )}
                          </div>
                        )}
                      </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}

            {showAttractions && markers.filter((marker) => marker.type === 'googleAttractions').map((marker) => (
              // Render googleAttractions markers when showAttractions is true
              <Marker
              key={`marker-${marker.id}`} 
                position={marker.position}
                title={marker.title}
                onClick={() => handleMarkerClick(marker)}
                options={marker.options}
                animation={marker.animation}
              >
                {selectedMarker === marker && (
                  <InfoWindow
                    position={selectedMarker.position}
                    onCloseClick={() => setSelectedMarker(null)}
                    
                  >
                  <div  className="custom-info-window" >
                        <h3>{selectedMarker.title}</h3>
                        {selectedMarker.info && (
                          <div>
                            <p>Address: {selectedMarker.info.address}</p>
                            <p>Rating: {selectedMarker.info.rating}</p>
                            {selectedMarker.info.photos && selectedMarker.info.photos.length > 0 && (
                              <img
                                src={selectedMarker.info.photos[0]}
                                alt={selectedMarker.title}
                              />
                            )}
                          </div>
                        )}
                      </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}

            {showRestaurants && markers.filter((marker) => marker.type === 'googleRestaurants').map((marker) => (
              // Render googleRestaurants markers when showRestaurants is true
              <Marker
              key={`marker-${marker.id}`} 
                position={marker.position}
                title={marker.title}
                onClick={() => handleMarkerClick(marker)}
                options={marker.options}
                animation={marker.animation}
              >
                {selectedMarker === marker && (
                  <InfoWindow
                    position={selectedMarker.position}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                   <div  className="custom-info-window" >
                        <h3>{selectedMarker.title}</h3>
                        {selectedMarker.info && (
                          <div>
                            <p>Address: {selectedMarker.info.address}</p>
                            <p>Rating: {selectedMarker.info.rating}</p>
                            {selectedMarker.info.photos && selectedMarker.info.photos.length > 0 && (
                              <img
                                src={selectedMarker.info.photos[0]}
                                alt={selectedMarker.title}
                              />
                            )}
                          </div>
                        )}
                      </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}


           

            {showHotels && markers.filter((marker) => marker.type === 'googleHotels').map((marker) => (
              // Render googleHotels markers when showHotels is true
              <Marker
              key={`marker-${marker.id}`} 
                position={marker.position}
                title={marker.title}
                onClick={() => handleMarkerClick(marker)}
                options={marker.options}
                animation={marker.animation}
              >
                {selectedMarker === marker && (
                  <InfoWindow
                    position={selectedMarker.position}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                  <div className="custom-info-window" >
                        <h3>{selectedMarker.title}</h3>
                        {selectedMarker.info && (
                          <div>
                            <p>Address: {selectedMarker.info.address}</p>
                            <p>Rating: {selectedMarker.info.rating}</p>
                            {selectedMarker.info.photos && selectedMarker.info.photos.length > 0 && (
                              <img
                                src={selectedMarker.info.photos[0]}
                                alt={selectedMarker.title}
                              />
                            )}
                          </div>
                        )}
                      </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}

            {heatmapVisible &&predictionNumber !== null && (
          
          <div style={{
            position: 'absolute',
            top: 100,
            left: 100,
            width: '140px',
            color:"#1C2541",
            maxWidth: 'calc(100% - 20px)',
            borderRadius: '10px',
            fontWeight:"bold",
            fontFamily:"monospace",
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
            fontSize: '12px',
          }}>
              <div style={{margin:"6px", fontSize: '14px',}}>
               Zoom Busyness:{Math.floor(predictionNumber)}
               </div>
              <div>
               <ColorLegend/>
               
              </div>
            </div>
            )}
            {directions && (
              <DirectionsRenderer
                options={{
                  directions: directions,
                }}
              />
            )}

          {initialMarkerPosition && (
            <Marker
              key={initialMarkerPosition.id} 
              position={{ lat: parseFloat(initialMarkerPosition.lat), lng: parseFloat(initialMarkerPosition.lng) }}
              title="Selected Location"
              animation={window.google.maps.Animation.BOUNCE}
              options={{
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  fillColor: '#e63946',
                  fillOpacity: 0.7,
                  strokeColor: 'white',
                  strokeWeight: 1,
                  scale: 8,
                },
              }}
            />
          )}
          
          </GoogleMap>
      

         
        {/* )} */}
      </div>
    </div>
  </div>
);
};

export default MapPage;