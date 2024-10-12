import axios from 'axios';

const apiKey =process.env.EXPO_PUBLIC_API_KEY!



const forecastEndpoit =(params:{city:string,days:number})=>`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.city}&days=${params.days}&aqi=no&alerts=no`

const locationEndpoint =(params:{city:string})=>`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.city}`


const apiCall =async (endpoit:string)=>{
    const options={
        method:'GET',
        url:endpoit
    }
    try{
        const response =await axios.request(options)
        return response.data
    }
    catch(err){
        console.log('error',err);
        return null
        
    }
}

export const fetchWeatherForecast = (params:{city:string,days:number})=>{
    return apiCall(forecastEndpoit(params))
}
export const fetchLocation = (params:{city:string})=>{
    return apiCall(locationEndpoint(params))
}