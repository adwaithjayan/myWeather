import { Image, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { theme } from "@/constants/theme";
import {MagnifyingGlassIcon} from "react-native-heroicons/outline";
import {CalendarDaysIcon, MapPinIcon} from "react-native-heroicons/solid";
import { useCallback, useEffect, useRef, useState } from "react";
import {debounce} from 'lodash'
import { fetchLocation, fetchWeatherForecast } from "@/api/weather";
import { weatherImages } from "@/constants/weatherIcon";
import { getData, storeData } from "@/util/asyncStorage";
import LottieView from 'lottie-react-native';

type item={
  country: string,
   id:number,
    region: string, 
    url:string,
    lat:number,
    Ion:number,
    name:string ,
}

type WeatherAPIResponse = {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    vis_miles: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        avgtemp_c: number;
        avgtemp_f: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
      };
      astro: {
        sunrise: string;
        sunset: string;
      };
    }>;
  };
};



export default function Index() {
  const [showSearch,SetShowSearch]=useState(false)
  const [loading,SetLoading]=useState(false)
  const [locations,setLocation]=useState([]);
  const [weather,setWeather]=useState({} as WeatherAPIResponse);
  const animation = useRef<LottieView>(null);

  const handleLocation =(loc:item)=>{
    setLocation([])
    SetShowSearch(false)
    SetLoading(true)
    fetchWeatherForecast({city:loc.name,days:7}).then(data=>{
      setWeather(data)
      storeData('city',loc.name)
  }).finally(()=>SetLoading(false))
    
  }
  const  handleSearch=(value:string)=>{
    if(value.length>2){
      fetchLocation({city:value}).then(data=>(
        setLocation(data)
        
      ))
    }
  };

  useEffect(()=>{
    fetchMyWeatherData()
  },[])
  const fetchMyWeatherData =async()=>{
    let myCity = await getData('city');
    let cityName ='Thalassery';
    if(myCity) {cityName = myCity};
    SetLoading(true)
    fetchWeatherForecast({city:cityName,days:7}).then(data=>(
      setWeather(data)
    )).finally(()=>SetLoading(false))
  }
  
  const handleTextDebounce =useCallback(debounce(handleSearch,1200),[])

  if(!weather) return null;

  const {current,location}= weather

  

  return (
    <View style={{flex:1,position:'relative'}}>
       <StatusBar barStyle="light-content"/>
       <Image blurRadius={70} source={require("../assets/images/bg.png")} style={{height:"100%",position:'absolute',width:"100%"}}/>
       
       {loading ?(
          <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
              
              <LottieView ref={animation} source={require('@/assets/lottie/loading.json')} style={{width:200,aspectRatio:1}} loop autoPlay/>

            </View>
       ):( 
       <SafeAreaView  style={{flex:1,marginTop:50}}>
        {/* search section */}

        <View style={{height:'7%',marginHorizontal:16,position:'relative',zIndex:50}}>
          <View style={{backgroundColor:showSearch ?theme.bgWhite(0.2):"transparent",flexDirection:'row',justifyContent:'flex-end',alignItems:"center",borderRadius:99}}>

          {
            showSearch ?(
              <TextInput placeholder="Search city" placeholderTextColor="lightgray" 
              onChangeText={handleTextDebounce}
            style={{height:40,paddingLeft:24,color:'white',paddingBottom:4,fontSize:16,flex:1}}/>
            ):null
          }


            
            <TouchableOpacity onPress={()=>SetShowSearch(!showSearch)}
            style={{backgroundColor:theme.bgWhite(0.3),borderRadius:99,padding:12,margin:4}}>
              <MagnifyingGlassIcon size="25" color="white"/>
            </TouchableOpacity>
          </View>
          {
            setLocation.length>0 && showSearch ?(
              <View style={{position:'absolute',top:64,borderRadius:24,backgroundColor:'rgb(209 213 219)',width:'100%'}}>
                {locations.map((item:item,i)=>{
                  
                  let showBorder =i+1 != locations.length
                  return(
                    <TouchableOpacity onPress={()=>handleLocation(item)}
                     key={i} style={{padding:12,paddingHorizontal:16,marginBottom:4,alignItems:'center',flexDirection:'row',borderWidth:0,borderBottomWidth:showBorder ?2 :0,borderBottomColor:'rgb(156 163 175)'}}>
                      <MapPinIcon size={20} color="gray"/>
                      <Text style={{marginLeft:8,color:'black',fontSize:18,lineHeight:28}}>
                        {item?.name},{item?.country}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            ):null
          }
        </View>

        {/*forecast section*/}

        <View style={{marginHorizontal:16,justifyContent:'space-around',flex:1,marginBottom:8}}>
          {/* location*/}
          <Text style={{color:'white',textAlign:'center',fontSize:24,fontWeight:'bold',lineHeight:32}}>{location?.name},
            <Text style={{fontSize:18,lineHeight:28 ,fontWeight:'semibold',color:'rgb(209 213 219)'}}>{""+location?.country}</Text>
          </Text>
              {/*weather image*/}

              <View style={{flexDirection:'row',justifyContent:'center'}}>
                <Image source={weatherImages[current?.condition?.text]} style={{height:208,width:208}}/>
              </View>
              {/*temperature*/}

              <View style={{marginTop:8}}>
                <Text style={{textAlign:'center',fontWeight:'bold',color:'white',marginLeft:20,fontSize:60}}>{current?.temp_c}&#176;</Text>
                <Text style={{textAlign:'center',color:'white',fontSize:20,letterSpacing:1.6}}>{current?.condition?.text}</Text>
              </View>

          {/* other stats*/}
            <View style={{flexDirection:'row',justifyContent:'space-between',marginHorizontal:16}}>
              <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                <Image style={{width:24,height:24}} source={require("../assets/icons/wind.png")}/>
                <Text style={{color:'white',fontWeight:'semibold',fontSize:16}}>
                  {current?.wind_kph} km/h
                </Text>
                </View>

              <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                <Image style={{width:24,height:24}} source={require("../assets/icons/drop.png")}/>
                <Text style={{color:'white',fontWeight:'semibold',fontSize:16}}>
                  {current?.humidity}%
                </Text>
                </View>

              <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                <Image style={{width:24,height:24}} source={require("../assets/icons/sun.png")}/>
                <Text style={{color:'white',fontWeight:'semibold',fontSize:16}}>
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
                </View>




            </View>



          </View>
          {/*forecast for nextdays*/}
          <View style={{marginBottom:8 ,gap:12}}>
            <View style={{flexDirection:'row',alignItems:'center',marginHorizontal:20,gap:8}}>
              <CalendarDaysIcon size={22} color="white"/>
              <Text style={{color:'white',fontSize:16}}>Daily forecast</Text>
              </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:15}}
            style={{marginBottom:15}}>


          {weather?.forecast?.forecastday?.map((item,i)=>{
            let date =new Date(item?.date);
            let dayName =date.toLocaleDateString('en-US',{weekday:'long'})
            dayName =dayName.split(',')[0]
            return(
                    <View key={i} style={{justifyContent:'center',alignItems:'center',paddingVertical:12,width:96,borderRadius:24,gap:4,marginRight:16,backgroundColor:theme.bgWhite(0.15)}}>
                  <Image source={weatherImages[item?.day?.condition?.text]} style={{height:44,width:44}}/>
                  <Text style={{color:'white'}}>{dayName}</Text>
                  <Text style={{color:'white',fontWeight:'semibold',fontSize:20}}>{item?.day?.avgtemp_c}&#176;</Text>
              </View>
            )

          })}

              
              </ScrollView>


          </View>

       </SafeAreaView>
       )}
    </View>
  );
}

