import React, {useState, useEffect, useRef, Component} from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    TextInput,
    Platform,
    PermissionsAndroid,
    Alert,
    FlatList,
    Dimensions,
    Linking,
    NativeModules,
} from 'react-native';

import { useIsFocused } from '@react-navigation/native';


import {
    CameraDeviceFormat,
    CameraRuntimeError,
    FrameProcessorPerformanceSuggestion,
    PhotoFile,
    sortFormats,
    useCameraDevices,
    useFrameProcessor,
    VideoFile,
    Camera
} from 'react-native-vision-camera';

import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFetchBlob from 'rn-fetch-blob';
import ImageResizer from '@bam.tech/react-native-image-resizer';

// import Share from 'react-native-share';
// import ImagePicker from 'react-native-image-picker';

// import * as IntentLauncher from 'expo-intent-launcher';
// import IntentLauncher, { IntentConstant } from 'react-native-intent-launcher'
// import DeviceInfo from 'react-native-device-info';

// import * as FileSystem from 'expo-file-system';
// import * as MediaLibrary from 'expo-media-library';
// import GetLocation from 'react-native-get-location';

import Geolocation from 'react-native-geolocation-service';
import moment from "moment";
import ImageMarker, {ImageFormat} from "react-native-image-marker"

// import CameraRoll from '@react-native-community/cameraroll';
// import ImgToBase64 from 'react-native-image-base64';

import CameraSvgComponent from "../../../assets/CameraSvg";
import CloseSvg from "../../../assets/CloseSvg";
import Marker from "react-native-image-marker";

const LoadingView = () => {
    return (
        <View style={{justifyContent:'center', alignItems:'center', flex:1}}>
            <Text style={{color:'black'}}>Load camera</Text>
        </View>
    )
}
function CameraComponent (props)  {

    const camera = useRef(null)
    const [camera_permission, setCameraPermission] = useState(false);
    const [recognition_data, setRecognitionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [waterMark, setWaterMark] = useState(require('../../../assets/image/whatermark.png'));

    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [accurancy, setAccurancy] = useState(null);
    const [date, setDate] = useState(null);
    const [image, setImage] = useState(null);

    const [cache_latitude, setLCacheLatitude] = useState(null);
    const [cache_longitude, setCacheLongitude] = useState(null);
    const [cache_date, setCacheDate] = useState(null);
    const [cache_accurancy, setCacheAccurancy] = useState(null);
    const [cache_image, setCacheImage] = useState(null);

    const [note, setNote] = useState('');
    const [local_notes, setLocalNotes] = useState([]);
    const [show_add_note_modal, SetShowAddNoteModal] = useState(false);

    const [image_url_from_gallery, setImageUrlFromGallery] = useState(false);
    const [show_uploaded_beeg_image, setShowUploadedBeegimage] = useState(false);

    const [app_work, setAppWork] = useState(true);

    const isFocused = useIsFocused();

    useEffect( () => {

        if (props.route.params.cache_image)
        {
            setCacheImage(props.route.params.cache_image)
        }

    }, [props.route.params.cache_image]);


    useEffect( () => {

        const unsubscribe = props.navigation.addListener('focus', () => {
            setImage(null)
            SetShowAddNoteModal(false)
        });

        return unsubscribe;

    }, [props.navigation]);


    useEffect( () =>
    {
        (async () => {
            const cameraPermission = await Camera.getCameraPermissionStatus();
            if(cameraPermission == 'denied')
            {
                const newCameraPermission = await Camera.requestCameraPermission()
                setCameraPermission(newCameraPermission)
            }
            await requestLocationPermission();
            getNotesFromLocalStorage()

        })();

    }, [camera_permission]);


   const requestLocationPermission = async () =>
   {
        if (Platform.OS === 'ios') {
            const auth = await Geolocation.requestAuthorization("whenInUse");
            if(auth === "granted") {
                const watchId = Geolocation.watchPosition(
                    (position) => {
                        setLongitude(position.coords.longitude);
                        setLatitude(position.coords.latitude);
                        setAccurancy(position.coords.accuracy.toFixed(2));
                        let date = moment(position.coords.timestamp).format('YYYY-MM-DD hh:mm:ss');
                        setDate(date);
                    },
                    (error) => {
                        console.log('Geolocation error:', error.message);
                    },
                    {
                        timeout: 15000,
                        maximumAge: 10000,
                        enableHighAccuracy: true,
                        distanceFilter: 1,
                        interval: 1000,
                        forceRequestLocation: true
                    },
                );

            }
            return null
        } else if (Platform.OS === 'android') {

            try {

                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                )

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {

                    const watchId = Geolocation.watchPosition(
                        (position) => {
                            // console.log('Geolocation new position:', position);
                            setLongitude(position.coords.longitude);
                            setLatitude(position.coords.latitude);
                            setAccurancy(position.coords.accuracy.toFixed(2));
                            let date = moment(position.coords.timestamp).format('YYYY-MM-DD hh:mm:ss');
                            setDate(date);
                        },
                        (error) => {
                            console.log('Geolocation error:', error.message);
                        },
                        {
                            timeout: 15000,
                            maximumAge: 10000,
                            enableHighAccuracy: true,
                            distanceFilter: 1,
                            interval: 1000,
                            forceRequestLocation: true
                        },
                    );
                } else {
                    requestLocationPermission()
                }
            } catch (err) {
                console.warn(err.message)
                return false
            }
        }
    }

    const checkPermission = async (image) => {

        if (Platform.OS === 'ios') {
            downloadImage(image);
        } else {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission Required',
                        message:
                            'App needs access to your storage to download Photos',
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // Once user grant the permission start downloading
                    console.log('Storage Permission Granted.');
                    downloadImage(image);
                } else {
                    // If permission denied then show alert
                    alert('Storage Permission Not Granted');
                }
            } catch (err) {
                // To handle permission related exception
                console.warn(err);
            }
        }
    };

    const downloadImage = async (image) =>
    {
        let date = new Date();
        let image_URL = image; //REMOTE_IMAGE_PATH;
        let ext = getExtention(image_URL);
        ext = '.' + ext[0];

        const { config , fs } = RNFetchBlob;

        let PictureDir,rootDir;

        if (Platform.OS == 'ios')
        {
            rootDir    = fs.dirs.DocumentDir;
            PictureDir = rootDir + '/image_' + Math.floor(date.getTime() + date.getSeconds() / 2) + ext;
            fs.cp( image_URL , PictureDir)
            .then(() => {
                setImageUrlFromGallery(PictureDir);
                console.log('Image saved to camera roll');
            })
            .catch((error) => {
                console.log('Error saving image to camera roll:', error);
            });

        }
        else {

             rootDir    = `${fs.dirs.DCIMDir}/NoteCamImages` ;
             PictureDir = rootDir + '/image_' + Math.floor(date.getTime() + date.getSeconds() / 2) + ext;

            RNFetchBlob.fs.isDir(rootDir)
                .then((isDir) => {

                    if (isDir) {
                        console.log('The folder NoteCamImages exists.');
                    } else {

                        RNFetchBlob.fs
                        .mkdir(rootDir)
                        .catch(err => {
                            console.log(err);
                        });
                        console.log('Create NoteCamImages folder successfuly');
                    }

                     fs.cp( image_URL , PictureDir)
                    .then(() => {
                        setImageUrlFromGallery(PictureDir)
                        console.log('Image saved to camera roll');
                    })
                    .catch((error) => {
                        console.log('Error saving image to camera roll:', error);
                    });

                })
                .catch((error) => {
                    console.log('Error checking folder:', error);
                });

        }

        console.log(image_URL,'image_URL')
        console.log(rootDir,'rootDir')
        console.log(PictureDir,'PictureDir')
    };

    const getExtention = filename => {
        // To get the file extension
        return /[.]/.exec(filename) ?
            /[^.]+$/.exec(filename) : undefined;
    };

    const takePhoto = async () =>
    {
        setLoading(true);

        const photo = await camera.current.takePhoto({
            flash: 'on',
        })

        setLoading(false);
        setImage(Platform.OS === 'android' ? 'file://' + photo.path : photo.path)
        SetShowAddNoteModal(true)

        setLCacheLatitude(latitude)
        setCacheLongitude(longitude)
        setCacheAccurancy(accurancy)
        setCacheDate(date)

        let _note = local_notes.length > 0 ? local_notes[local_notes.length - 1] : '';
        setNote(_note);

    }

    const saveNoteToLocalStorage = async (_note = null) =>
    {
        let local_notes_arr = await AsyncStorage.getItem('notes');
        local_notes_arr = local_notes_arr ? JSON.parse(local_notes_arr) :  [];
        local_notes_arr.push(_note ? _note : note)
        await AsyncStorage.setItem('notes', JSON.stringify(local_notes_arr));
        setLocalNotes(local_notes_arr)
        let new_local_notes_arr = await AsyncStorage.getItem('notes');
    }

     const getNotesFromLocalStorage = async () =>
    {
        let local_notes_arr = await AsyncStorage.getItem('notes');
        local_notes_arr = local_notes_arr ? JSON.parse(local_notes_arr) :  [];
        setLocalNotes(local_notes_arr)
        console.log(local_notes_arr, 'local_notes_arrlocal_notes_arr')
    }

   const clearNotesFromLocalStorage = async () =>
    {
        await AsyncStorage.removeItem('notes');
        setLocalNotes([])
        setNote('')
    }

    // Обрабатывает фото при нажатие сохранить
    const savePhotoWithWhatermark = async ()=>
    {

        let option1 = {
            src: image,
            text: `Долгота: ${cache_longitude} \nШирота: ${cache_latitude} \nТочность: ${cache_accurancy} \nОписание: ${note.length > 0 ? note : 'Без описания'}`,
            // X: 30,
            // Y: 30,
            color: '#ffffff', // '#ff0000aa' '#f0aa'
            position: 'bottomLeft',
            fontName: 'Arial-BoldItalicMT',
            fontSize: 44,
            textBackgroundStyle: {
                type: 'stretchX',
                paddingX: 30,
                paddingY: 30,
                color: '#000000B2' // '#0f0a'
            },
            scale: 1,
            quality: 100
        }

        ImageMarker.markText(option1).then(async (res) => {

            Marker.markImage({
                src:  Platform.OS === 'android' ? 'file://' + res : res ,
                markerSrc: waterMark,
                // X: evt.nativeEvent.locationX,
                // Y: evt.nativeEvent.locationY,
                // marker scale
                position: 'bottomRight',
                scale: 1,
                markerScale: 1,
                quality: 100,
                saveFormat: ImageFormat.png
            }).then( async (path) => {

                let url = Platform.OS === 'android' ? 'file://' + path : path;
                console.log(url, 'add whatermark')
                // let resized_image = await ImageResizer.createResizedImage(
                //     path,
                //     1000, //sizeTarget,
                //     1000,//sizeTarget,
                //     'PNG',
                //     100,
                //     0,
                //     undefined,
                //     false,
                //     {
                //         mode: 'contain',//selectedMode,
                //         onlyScaleDown:false//onlyScaleDown,
                //     }
                // );
                let resized_image = url;

                console.log(resized_image, 'resized_imageresized_imageresized_image')
                console.log(resized_image, '-------resized_image------')
                // Optimize Image Size End
                // setCacheImage(`file://${res}`);
                setCacheImage(resized_image);
                SetShowAddNoteModal(false);

                saveNoteToLocalStorage();
                checkPermission(resized_image)
                // setImage(`file://${res}`)
                console.log("the path is "+ resized_image)

            }).catch((err) => {
                console.log('====================================')
                console.log(err, 'err')
                console.log('====================================')
            })

        }).catch((err) => {
            console.log(err)

        })

    }


    // Обрабатывает фото при нажатие выбрать стрелку
    const savePhotoWithWhatermarkBeforeSelectArrow = async ()=>
    {
        let option1 = {
            src: image,
            text: `Долгота: ${cache_longitude} \nШирота: ${cache_latitude} \nТочность: ${cache_accurancy} \nОписание: ${note.length > 0 ? note : 'Без описания'}`,
            // X: 30,
            // Y: 30,
            color: '#ffffff', // '#ff0000aa' '#f0aa'
            position: 'bottomLeft',

            fontName: 'Arial-BoldItalicMT',
            fontSize: 44,

            textBackgroundStyle: {
                type: 'stretchX',
                paddingX: 30,
                paddingY: 30,
                color: '#000000B2' // '#0f0a'
            },
            scale: 1,
            quality: 100
        }

        ImageMarker.markText(option1).then(async (res) => {
            Marker.markImage({
                src: `file://${res}`,
                markerSrc: waterMark,
                // X: evt.nativeEvent.locationX,
                // Y: evt.nativeEvent.locationY,
                // marker scale
                position: 'bottomRight',
                scale: 1,
                markerScale: 1,
                quality: 100,
                saveFormat: ImageFormat.png
            }).then( async (path) => {

                let url = Platform.OS === 'android' ? 'file://' + path : path;
                console.log(url, 'add whatermark')

                // let resized_image = await ImageResizer.createResizedImage(
                //     url,
                //     1000, //sizeTarget,
                //     1000,//sizeTarget,
                //     'PNG',
                //     100,
                //     0,
                //     undefined,
                //     false,
                //     {
                //         mode: 'contain',//selectedMode,
                //         onlyScaleDown:false//onlyScaleDown,
                //     }
                // );
                //
                // console.log(resized_image, 'resized_imageresized_imageresized_image')
                // resized_image = resized_image.uri;
                // Optimize Image Size End

                let resized_image = url;

                console.log(resized_image, 'resized_imageresized_imageresized_image')
                // resized_image = resized_image.uri;
                console.log(resized_image, '-------resized_image------')
                // Optimize Image Size End

                // setCacheImage(`file://${res}`);
                setCacheImage(resized_image);
                SetShowAddNoteModal(false);


                saveNoteToLocalStorage();

                console.log(resized_image, 'imageimageimage')
                props.navigation.navigate('ImageRedactorComponent', {
                    uri: resized_image
                })

            }).catch((err) => {
                console.log('====================================')
                console.log(err, 'err')
                console.log('====================================')
            })

        }).catch((err) => {
            console.log(err)
        })

    }


    const openGallery = () => {

        // OPEN IMAGE BEEG POPUP

        setShowUploadedBeegimage(true)

        // ImageGalleryModule.openImageInGallery(image_url_from_gallery, success => {
        //     console.log(success,'success' )
        //     console.log(image_url_from_gallery, 'ImageGalleryModule.openImageInGallery')
        //     if (success) {
        //         console.log('Image opened in gallery');
        //     } else {
        //         console.log('Failed to open image in gallery');
        //     }
        // });

    };

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const devices = useCameraDevices()
    const device = devices.back
    if (device == null || !app_work) return <LoadingView />

    return (
        <SafeAreaView style={{backgroundColor:'white'}}>

            <View style={{width:'100%', height: '100%'}}>

                <View style={{position:'absolute', alignSelf:'center', top: windowHeight/2, zIndex: 999999}}>
                    <Image source={require('../../../assets/image/icons8-focus-96.png')} style={{width: 60, height: 60}}/>
                </View>

                {isFocused &&

                    <Camera
                        ref={camera}
                        style={styles.camera}
                        device={device}
                        isActive={true}
                        photo={true}
                    />

                }


            </View>


            {/*Show cordinates on Camera*/}
            {!loading &&

                <View style={{width:130, backgroundColor:'rgba(255,255,255,0.78)',  position:'absolute', bottom:20, left:10, padding:5}}>

                    <Text style={{color:'black', fontSize:10}}>Долгота: {longitude}</Text>
                    <Text style={{color:'black', fontSize:10}}>Широта: {latitude}</Text>
                    {/*<Text style={{color:'black', fontSize:10}}>Дата: {date}</Text>*/}
                    <Text style={{color:'black', fontSize:10}}>Точность: {accurancy}</Text>

                </View>

            }


            {/*Show loader on camera button or Camera Button*/}
            {loading ?
                <ActivityIndicator style={styles.loader}/>
                :
                <TouchableOpacity style={styles.take_photo} onPress={() => {takePhoto()}}>
                    <CameraSvgComponent  style={{width: 50, height: 50}}/>
                </TouchableOpacity>
            }



            {/*Show Image after record*/}
            {cache_image &&
                <TouchableOpacity
                    style={[{width: 80, height:80, position:'absolute', right: 10, bottom:20}]}
                    onPress={()=>{
                        // Linking.openSettings()
                        openGallery()
                    }}
                >
                    <Image source={{uri: cache_image}}  style={{width: '100%', height: '100%', resizeMode:'contain'}}/>
                </TouchableOpacity>
            }


            {show_uploaded_beeg_image &&

                <View style={{width:'100%', height:'100%', padding:15, position:'absolute', top:0, left: 0, backgroundColor:'black', justifyContent:'center', alignItems:'center', zIndex: 999999}}>

                    <TouchableOpacity
                        style={{position:'absolute', top:15, right: 15, zIndex:99999999}}
                        onPress={()=>{
                            setShowUploadedBeegimage(false);
                        }}
                    >
                        <CloseSvg style={{width:40, height:40}}/>
                    </TouchableOpacity>

                    <View style={{width:'100%', flex:1}}>
                        <Image source={{uri: cache_image}}  style={{width: '100%', height: '100%', resizeMode:'contain'}}/>

                    </View>

                </View>

            }


            {/*Show Image after record*/}
            {/*{cache_image &&*/}
            {/*    <View style={[{width: '80%', height:'80%',  position:'absolute', right: '10%', top:'10%'}]} >*/}
            {/*        <Image source={{uri: cache_image}}  style={{width: '100%', height: '100%', resizeMode:'contain'}}/>*/}
            {/*    </View>*/}
            {/*}*/}



            {/*Show add note Modal*/}
            {show_add_note_modal &&

              <View style={[ styles.add_note_wrapper ]}>
                <View style={[{height: '70%', width: '100%'}, styles.add_note_wrapper_content]}>
                    <Text style={{color:'black',fontSize:15,textAlign:'center',height:40}}>Данные на фото</Text>

                    <ScrollView nestedScrollEnabled={true} style={[{flex:1}]}>

                       <View style={{width:'100%', flexDirection: 'row', justifyContent:'space-between'}}>
                           <Text style={{color:'black', paddingVertical:10}}>Описание фото</Text>
                           <TouchableOpacity
                               onPress={() => {
                                   savePhotoWithWhatermarkBeforeSelectArrow()
                               }}
                           >
                               <Text style={{color:'blue', paddingVertical:10}}>Выбрать стрелку</Text>
                           </TouchableOpacity>
                       </View>
                        <TextInput
                            multiline
                            value={note}
                            onChangeText={(note_value) => setNote(note_value)}
                            // onBlur={() => this.onBlurLogin()}
                            style={[{ paddingHorizontal: 15, color:'black',borderColor: 'silver', borderWidth: 1}]}
                            label='Описание фото'
                            theme={{colors: {text: '#55545F', primary: 'red'}}}
                            underlineColor='transparent'
                            underlineColorAndroid ='transparent'
                            selectionColor='#E1C1B7'
                            activeOutlineColor='transparent'
                        />

                        <View style={{flexDirection:'row', justifyContent:'space-between', width:'100%'}}>
                            <Text style={{color:'black', paddingVertical:10}}>История описаний</Text>

                            {local_notes.length > 0 &&
                                <TouchableOpacity onPress={()=>{clearNotesFromLocalStorage()}}>
                                    <Text style={{color:'red', paddingVertical:10}}>Очистить историю</Text>
                                </TouchableOpacity>
                            }

                        </View>

                        <View style={{ width: '100%', height:150, borderColor: 'silver', borderWidth: 1}}>

                            {local_notes.length == 0 ?

                                <View style={{width: '100%', flex:1,  justifyContent:'center', alignItems:'center'}}>
                                    <Text style={{color:'black'}}>История пуста</Text>
                                </View>

                                :

                                <ScrollView nestedScrollEnabled={true} style={[{flex:1, paddingHorizontal: 10}]}>
                                    {local_notes.map((item, index) => {
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={styles.local_notes_item}
                                                onPress={() => {
                                                    setNote(item);
                                                }}
                                            >
                                                <Text style={{color:'black', width:'100%'}}>{item}</Text>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </ScrollView>

                            }
                        </View>



                        <View style={{width:'100%', height:150,marginTop:5, padding:10, backgroundColor:'rgba(117,116,116,0.78)'}}>
                            <ScrollView nestedScrollEnabled={true} style={{flex:1}}>
                                <Text style={{color:'white', fontSize:12}}>Долгота: {cache_longitude}</Text>
                                <Text style={{color:'white', fontSize:12}}>Широта: {cache_latitude}</Text>
                                <Text style={{color:'white', fontSize:12}}>Точность: {cache_accurancy}</Text>
                                {/*<Text style={{color:'white', fontSize:12}}>Дата: {cache_date}</Text>*/}
                                <Text style={{color:'white', fontSize:12}}>Описание: {note.length > 0 ? note : 'Без описания'}</Text>
                            </ScrollView>
                        </View>

                    </ScrollView>

                    <View style={{width: '100%', flexDirection:'row', justifyContent:'center', }}>

                        <TouchableOpacity
                            onPress={()=>{
                                savePhotoWithWhatermark();
                            }}
                            style={styles.saveBtn}
                        >
                            <Text style={{color:'black', fontSize:14}}>Сохранить</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={()=>{
                                setImage(null)
                                SetShowAddNoteModal(false)
                            }}
                            style={styles.cancelBtn}
                        >
                            <Text style={{color:'black', fontSize:14}}>Отменить</Text>
                        </TouchableOpacity>
                    </View>
                </View>
              </View>
            }

        </SafeAreaView>
    )
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black'
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
    camera: {
        width:'100%',
        height: '100%',
        // backgroundColor:'red',
        // borderColor:'red',
        borderWidth:2
    },
    take_photo: {
        position:'absolute',
        zIndex: 2,
        bottom: 20,
        alignSelf: 'center',
        width: 80,
        height: 80,
        borderRadius: 50,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white'
    },
    loader: {
        position:'absolute',
        zIndex: 2,
        bottom: 20,
        alignSelf: 'center',
        width: 80,
        height: 80,
        borderRadius: 50,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white'
    },
    local_notes_wrapper: {
        borderColor: 'silver',
        borderWidth: 1,
        paddingTop:0,
        paddingBottom:0,
        padding:10,
        height: 150
        // paddingHorizontal:10

    },
    local_notes_item: {
        borderBottomColor:'silver',
        borderBottomWidth:1,
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
        paddingVertical:10,
        // paddingHorizontal:10
    },
    add_note_wrapper: {
        width: '100%',
        height:'100%',
        position:'absolute',
        bottom: 0,
        left:0,
        backgroundColor:'rgba(0,0,0,0.69)',
        alignSelf:'center',
        zIndex:9999,
        justifyContent:'center',
        alignItems:'center',
        padding: 20
    },
    add_note_wrapper_content: {
        width: '100%',
        backgroundColor:'white',
        borderRadius:15,
        padding:15,
    },
    saveBtn: {
        paddingHorizontal:10,
        paddingVertical:5,
        backgroundColor:'silver',
        borderRadius:5,
        margin:5,
        marginTop:20
    },
    cancelBtn: {
        paddingHorizontal:10,
        paddingVertical:5,
        backgroundColor:'silver',
        borderRadius:5,
        margin:5,
        marginTop:20
    }
});


export default CameraComponent;
