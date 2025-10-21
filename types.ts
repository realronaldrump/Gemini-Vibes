
export interface Vehicle {
  vin: string;
  imei: string;
  nickName: string;
  model: {
    make: string;
    name: string;
    year: number;
  };
}

export interface Trip {
  transactionId: string;
  distance: number;
  gps: string; // This is a stringified GeoJSON
  startTime: string;
  endTime: string;
  maxSpeed: number;
}

// GeoJSON structure after parsing the trip.gps string
export interface GeoJSONLineString {
  type: "LineString";
  coordinates: [number, number][]; // [longitude, latitude]
}
