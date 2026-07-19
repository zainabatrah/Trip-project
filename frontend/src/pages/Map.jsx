import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";


// ================= MARKERS =================

const startIcon = new L.DivIcon({
  className: "",
  iconSize: [55, 25],
  iconAnchor: [27, 25],

  html: `
    <div style="
      background:#16a34a;
      color:white;
      padding:4px 8px;
      border-radius:15px;
      font-size:10px;
      font-weight:bold;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    ">
      🟢 START
    </div>
  `,
});


const endIcon = new L.DivIcon({
  className: "",
  iconSize:[55,25],
  iconAnchor:[27,25],

  html:`
    <div style="
      background:#dc2626;
      color:white;
      padding:4px 8px;
      border-radius:15px;
      font-size:10px;
      font-weight:bold;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    ">
      🔴 END
    </div>
  `,
});



// ================= AUTO ZOOM =================

function FitBounds({points}){

  const map = useMap();


  useEffect(()=>{

    if(points.length){

      map.fitBounds(
        L.latLngBounds(points),
        {
          padding:[50,50]
        }
      );

    }

  },[points,map]);


  return null;
}




// ================= PAGE =================


export default function Map(){

const {tripId}=useParams();


const [trip,setTrip]=useState(null);

const [roadRoute,setRoadRoute]=useState([]);





// GET TRIP

useEffect(()=>{

async function getTrip(){

try{

const res = await fetch(
`http://localhost:5000/api/trips/${tripId}`
);


const data = await res.json();


console.log("TRIP:",data);


setTrip(data.trip);


}
catch(error){

console.log(error);

}

}


getTrip();


},[tripId]);





// ================= ROAD ROUTE =================


useEffect(()=>{


async function getRoad(){


if(!trip)
return;



let points=[];



// START

if(trip.fromLocation){

points.push(
`${trip.fromLocation.lng},${trip.fromLocation.lat}`
);

}



// STOPS

trip.stops?.forEach(stop=>{


if(
typeof stop.lat==="number" &&
typeof stop.lng==="number"
){

points.push(
`${stop.lng},${stop.lat}`
);

}

});



// END

if(trip.toLocation){

points.push(
`${trip.toLocation.lng},${trip.toLocation.lat}`
);

}




if(points.length < 2)
return;



const url =
`https://router.project-osrm.org/route/v1/driving/${points.join(";")}?overview=full&geometries=geojson`;



const res = await fetch(url);

const data = await res.json();



if(data.routes?.length){


const coords =
data.routes[0]
.geometry
.coordinates
.map(point=>[
point[1],
point[0]
]);


setRoadRoute(coords);


}


}



getRoad();


},[trip]);







if(!trip){

return (

<div style={{padding:"30px"}}>

<h2>
Loading map...
</h2>

</div>

);

}






const from=[
trip.fromLocation.lat,
trip.fromLocation.lng
];


const to=[
trip.toLocation.lat,
trip.toLocation.lng
];





const validStops =
trip.stops?.filter(
stop =>
typeof stop.lat==="number" &&
typeof stop.lng==="number"
) || [];





const allPoints=[

from,

...validStops.map(
stop=>[
stop.lat,
stop.lng
]
),

to

];





const duration =
typeof trip.duration === "object"
?
trip.duration.value
:
trip.duration;





return(

<div

style={{

background:"#eff6ff",

minHeight:"100vh",

padding:"25px"

}}

>



{/* HEADER */}


<div

style={{

background:"white",

padding:"20px",

borderRadius:"22px",

marginBottom:"20px",

boxShadow:
"0 10px 30px rgba(0,0,0,0.12)"

}}

>


<h1

style={{

margin:0,

color:"#0369a1"

}}

>

{trip.title}

</h1>



<h3>

📍 {trip.from} → {trip.to}

</h3>



<p>

<b>Stops:</b>{" "}

{

validStops
.map(
s=>s.name
)
.join(" • ")

}


</p>


</div>






{/* MAP */}


<div

style={{

height:"600px",

borderRadius:"25px",

overflow:"hidden",

boxShadow:
"0 15px 40px rgba(0,0,0,0.2)"

}}

>


<MapContainer

center={from}

zoom={10}

style={{

height:"100%",

width:"100%"

}}

>


<FitBounds points={allPoints}/>



<TileLayer

url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"

/>





{/* START */}


<Marker

position={from}

icon={startIcon}

/>







{/* STOPS */}



{

validStops.map(
(stop,index)=>{


const icon =
new L.DivIcon({

className:"",

iconSize:[25,25],

iconAnchor:[12,12],


html:`

<div style="

background:#2563eb;

color:white;

width:25px;

height:25px;

border-radius:50%;

display:flex;

align-items:center;

justify-content:center;

font-size:11px;

font-weight:bold;

border:2px solid white;

box-shadow:0 2px 6px rgba(0,0,0,0.3);

">

${index+1}

</div>

`

});



return(

<Marker

key={index}

position={[
stop.lat,
stop.lng
]}

icon={icon}

/>

);


}

)

}






{/* END */}


<Marker

position={to}

icon={endIcon}

/>







{/* ROAD */}

{

roadRoute.length>0 &&

<Polyline

positions={roadRoute}

weight={5}

/>

}





</MapContainer>



</div>







{/* INFO */}


<div

style={{

display:"flex",

gap:"15px",

flexWrap:"wrap",

marginTop:"20px"

}}

>


{

[

`🚌 ${trip.transportation}`,

`📅 ${new Date(trip.date).toLocaleDateString()}`,

`⏱ ${duration} Days`,

`👥 ${trip.numberOfTravelers} Travelers`

]

.map(
(item,index)=>(


<div

key={index}

style={{

background:"white",

padding:"15px 25px",

borderRadius:"20px",

boxShadow:
"0 8px 20px rgba(0,0,0,0.1)",

fontWeight:"600"

}}

>

{item}

</div>


)

)

}


</div>




</div>


);


}
