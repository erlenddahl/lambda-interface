export const SELECTION_MODE = {
    SINGLE: "SELECTION_MODE_SINGLE",
    MULTIPLE: "SELECTION_MODE_MULTIPLE"
};

const isDebug = true;
export const API_URL = isDebug ? "https://localhost:44332/roadnetwork" : "http://mobilitet.sintef.no:14002/RoadNetwork";
export const MAPBOX_TOKEN = "pk.eyJ1IjoiZXJsZW5kZGFobCIsImEiOiJjamwyMjh6eWsxbTE4M3JxdGF3MHplb2l1In0.t2NyiwBoC_OjujWzYu9-rQ";