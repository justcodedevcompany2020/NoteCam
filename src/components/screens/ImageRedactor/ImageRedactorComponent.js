import React from 'react'
import {
    TouchableOpacity,
    Image,
    View,
    Text,
    Platform,
    Dimensions,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Pressable,
    PermissionsAndroid,
    SafeAreaView,
} from 'react-native'
import Marker, { Position, ImageFormat } from 'react-native-image-marker'
import Picker from 'react-native-image-picker'
import RNFetchBlob from "rn-fetch-blob";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {awrap} from "@babel/runtime/regenerator";
import ImageResizer from "@bam.tech/react-native-image-resizer";
const icon = require('./icon.jpeg')
// const iconTP = require('./tpimage.png')
const bg = require('./bg.png')
// const base64Bg = require('./bas64bg').default
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window')

const s = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20
    },
    op: {
        marginTop: 20,
        justifyContent: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#f1f1f1',
        padding: 10
    },
    btn: {
        padding: 10,
        borderRadius: 3,
        backgroundColor: '#00BF00',
        margin: 5,
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnOp: {
        padding: 10,
        borderRadius: 3,
        backgroundColor: '#1A1AA1',
        margin: 5,
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        fontSize: 15,
        color: 'white'
    },
    preview: {
        width:'100%',
        height: '100%',
        flex: 1,
        backgroundColor: 'black',
        resizeMode:'contain'
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
    }})

const textBgStretch = ['', 'stretchX', 'stretchY']

export default class MarkerTest extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            uri: this.props.route.params.uri,
            image: this.props.route.params.uri,
            marker: icon,
            markImage: true,
            base64: false,
            useTextShadow: true,
            useTextBgStyle: true,
            textBgStretch: 0,
            saveFormat: ImageFormat.png,
            loading: false,
            arrow_selected: false,
            open_arrow_select_popup: true,
            rangeValue: 0,

            markerSrc: null,
            show_save_button: false,
            locationX: 0,
            locationY: 0,
        }
    }



    componentDidMount() {
        console.log(this.props.route.params.uri, 'this.props.uri')
    }


    selectArrow = async (markerSrcUri) =>{

        // if (!this.state.arrow_selected)
        // {
        //     return false;
        // }
        // // this.handlePress(evt)
        // console.log(`x coord = ${parseInt(evt.nativeEvent.locationX)}`);
        // console.log(`y coord = ${parseInt(evt.nativeEvent.locationY)}`);
        // // console.log(evt);
        //

        let locationX = 200;
        let locationY = 200;

        this.setState({
            locationX: locationX,
            locationY: locationY
        })
        //
        // console.log(this.state.markImage, 'this.state.markImage')
        // console.log(this.state.image, 'this.state.image')
        // console.log(evt, 'tevt')

        Marker.markImage({
            src: this.state.image,
            // markerSrc: require('./forward-arrow-icon-15.jpeg'),
            markerSrc: markerSrcUri,
            // X: 800,
            // Y: 800,
            X: locationX,
            Y: locationY,
            // marker scale
            // position: type,
            scale: 1,
            markerScale: 0.5,
            quality: 100,
            saveFormat: this.state.saveFormat
        }).then( async (path) => {
            let url = Platform.OS === 'android' ? 'file://' + path : path;
            console.log(url, 'converted image url')
            await this.setState({
                uri: url,
                show: true,
                loading: false,
                show_save_button: true,
                markerSrc: markerSrcUri,
                open_arrow_select_popup: false,
                arrow_selected: true
            })
        }).catch((err) => {
            console.log('====================================')
            console.log(err, 'err')
            console.log('====================================')
        })

    }


    resizeImage = async (image) => {
        let resized_image = await ImageResizer.createResizedImage(
            // `file://${res}`,
            image,
            1000, //sizeTarget,
            1000,//sizeTarget,
            'PNG',
            100,
            0,
            undefined,
            false,
            {
                mode: 'contain',//selectedMode,
                onlyScaleDown:false//onlyScaleDown,
            }
        );

        return resized_image;
    }

    checkPermission = async () => {
        this.setState({
            loading: true
        })
        let image = this.state.uri

        if (Platform.OS === 'ios') {
            this.downloadImage(image);
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
                    this.downloadImage(image);
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

    downloadImage = async (image) =>
    {
        let date = new Date();
        let image_URL = image; //REMOTE_IMAGE_PATH;
        let ext = this.getExtention(image_URL);
        ext = '.' + ext[0];
        const { config , fs } = RNFetchBlob;

        let PictureDir,rootDir;
        if (Platform.OS == 'ios')
        {
            rootDir    = fs.dirs.DocumentDir;
            PictureDir = rootDir + '/image_' + Math.floor(date.getTime() + date.getSeconds() / 2) + ext;
            fs.cp( image_URL , PictureDir)
            .then(async () => {

                await this.setState({
                    loading: false,
                    arrow_selected: false,
                    open_arrow_select_popup: false,
                    markerSrc: null,
                    show_save_button: false
                })

                this.props.navigation.navigate('CameraComponent', {
                    cache_image: image
                })
                console.log('Image saved to camera roll');
            })
            .catch((error) => {
                console.log('Error saving image to camera roll:', error);
            });
        } else {

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
                        .then(async () => {


                            await this.setState({
                                loading: false,
                                arrow_selected: false,
                                open_arrow_select_popup: false,
                                markerSrc: null,
                                show_save_button: false
                            })

                            console.log(image, 'from redirect');

                            this.props.navigation.navigate('CameraComponent', {
                                cache_image: image
                            })

                            // setImageUrlFromGallery(PictureDir)
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

    getExtention = (filename) => {
        // To get the file extension
        return /[.]/.exec(filename) ?
            /[^.]+$/.exec(filename) : undefined;
    };


    _showLoading = () => {
        this.setState({
            loading: true
        })
    }

    _hideLoading = () => {
        this.setState({
            loading: false
        })
    }

    moveMarketOnImage = (move_side = '') => {

        let {locationX, locationY} = this.state

        let n_locationX = locationX;
        let n_locationY = locationY;

        if (move_side == 'right') {
            n_locationX = locationX + 50;
        }
        else if (move_side == 'left') {
            n_locationX = locationX - 50;
        }
        else if (move_side == 'top') {
            n_locationY = locationY - 50;
        }
        else if (move_side == 'bottom') {
            n_locationY = locationY + 50;
        }


        if (!this.state.arrow_selected)
        {
            return false;
        }
        // this.handlePress(evt)
        console.log(`x coord = ${n_locationX}`);
        console.log(`y coord = ${n_locationY}`);

        this.setState({
            locationX: n_locationX,
            locationY: n_locationY
        })

        Marker.markImage({
            src: this.state.image,
            // markerSrc: require('./forward-arrow-icon-15.jpeg'),
            markerSrc: this.state.markerSrc,
            X: n_locationX,
            Y: n_locationY,
            // marker scale
            // position: type,
            scale: 1,
            markerScale: 0.5,
            quality: 100,
            saveFormat: this.state.saveFormat
        }).then( async (path) => {
            let url = Platform.OS === 'android' ? 'file://' + path : path;
            console.log(url, 'converted image url')
            await this.setState({
                uri: url,
                // show: true,
                // loading: false,
                show_save_button: true
            })
        }).catch((err) => {
            console.log('====================================')
            console.log(err, 'err')
            console.log('====================================')
        })


    }



    render () {
        return (
            <SafeAreaView style={{ flex: 1 }}>

                {this.state.show_save_button &&

                    <TouchableOpacity
                        onPress={ ()=>{
                             this.checkPermission();
                        }}
                        style={{position:'absolute', top: 20, right: 20, zIndex:9999,height: 40, justifyContent:'center' }}
                    >
                        <Text style={{ color:'white', fontWeight: 'bold'}}>Сохранить</Text>
                    </TouchableOpacity>

                }

                {this.state.show_save_button &&

                    <View style={{position:'absolute', bottom: 140, zIndex:999999, alignSelf:'center', backgroundColor:'transparent', alignItems:'center', width:140,  flexDirection:'column', justifyContent:'space-between'}}>

                        <View>
                            <TouchableOpacity style={{ position:'relative', top:10, width:50, height:50, backgroundColor:'#4765d9', justifyContent:'center', alignItems:'center', borderRadius:100}} onPress={()=>{this.moveMarketOnImage('top')}}>
                                <Text style={{transform: [{ rotate: '90deg'}], color: 'white', fontSize: 15}}>{'<'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{flexDirection:'row', justifyContent:'space-between', width:'100%'}} >
                            <TouchableOpacity style={{position:'relative',width:50, height:50, backgroundColor:'#4765d9', justifyContent:'center', alignItems:'center', borderRadius:100}} onPress={()=>{this.moveMarketOnImage('left')}}>
                                <Text style={{ color: 'white', fontSize: 15}}>{'<'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ position:'relative', width:50, height:50, backgroundColor:'#4765d9', justifyContent:'center', alignItems:'center', borderRadius:100}} onPress={()=>{this.moveMarketOnImage('right')}}>
                                <Text style={{ color: 'white', fontSize: 15}}>{'>'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View>
                            <TouchableOpacity style={{ position:'relative', bottom: 10, width:50, height:50, backgroundColor:'#4765d9', justifyContent:'center', alignItems:'center', borderRadius:100}} onPress={()=>{this.moveMarketOnImage('bottom')}}>
                                <Text style={{transform: [{ rotate: '-90deg'}], color: 'white', fontSize: 15}}>{'<'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                }


                <TouchableOpacity
                    onPress={()=>{
                        this.setState({
                           open_arrow_select_popup: true
                        })
                    }}
                    style={{position:'absolute', top: 20, left: 20, zIndex:9999,height: 40, justifyContent:'center' }}
                >
                    <Text style={{ color:'white', fontWeight: 'bold'}}>Выбрать стрелку</Text>
                </TouchableOpacity>

                <Pressable
                    style={{
                        alignSelf: 'center',
                        width: width,
                        flex:1
                    }}
                >

                    <Image source={{ uri: this.state.uri }}  style={s.preview} />

                </Pressable>



                {this.state.loading &&
                    <View style={{
                        position: 'absolute',
                        width,
                        height,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 99999999
                    }}>
                        <ActivityIndicator size='large' />
                        <Text style={{ color: 'white' }}>Сохранение...</Text>
                    </View>
                }



                {this.state.open_arrow_select_popup &&

                    <View style={{
                        position: 'absolute',
                        width,
                        height,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>

                        <View style={{
                            width: '80%',
                            height: 300,
                            backgroundColor: 'white',
                            borderRadius: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 15
                        }}>

                            <View style={{width:150}}>
                                <View style={{width:'100%', alignItems:'center', flexDirection:'row', justifyContent:'space-between'}}>

                                    <TouchableOpacity
                                        onPress={()=> {
                                            this.selectArrow(require('./arr2/mdi_arrow-down-bold-3.png'))
                                        }}
                                    >
                                        <Image source={require('./arr2/mdi_arrow-down-bold-3.png')} style={{width:40, height:40}}/>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={()=> {
                                            this.selectArrow(require('./arr2/mdi_arrow-down-bold-1.png'))
                                        }}
                                    >
                                        <Image source={require('./arr2/mdi_arrow-down-bold-1.png')} style={{width:40, height:40}}/>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={()=> {
                                            this.selectArrow(require('./arr2/mdi_arrow-down-bold-4.png'))
                                        }}
                                    >
                                        <Image source={require('./arr2/mdi_arrow-down-bold-4.png')} style={{width:40, height:40}}/>
                                    </TouchableOpacity>
                                </View>

                                <View style={{width:'100%', flexDirection:'row', justifyContent:'space-between'}}>
                                    <TouchableOpacity
                                        onPress={()=> {
                                            this.selectArrow(require('./arr2/mdi_arrow-down-bold-7.png'))
                                        }}
                                    >
                                        <Image source={require('./arr2/mdi_arrow-down-bold-7.png')} style={{width:40, height:40}}/>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={()=> {
                                            this.selectArrow(require('./arr2/mdi_arrow-down-bold-2.png'))
                                        }}
                                    >
                                        <Image source={require('./arr2/mdi_arrow-down-bold-2.png')} style={{width:40, height:40}}/>
                                    </TouchableOpacity>
                                </View>

                                <View style={{width:'100%', alignItems:'center',flexDirection:'row', justifyContent:'space-between'}}>
                                    <TouchableOpacity
                                        onPress={()=> {
                                            this.selectArrow(require('./arr2/mdi_arrow-down-bold-6.png'))
                                        }}
                                    >
                                        <Image source={require('./arr2/mdi_arrow-down-bold-6.png')} style={{width:40, height:40}}/>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={()=> {
                                            this.selectArrow(require('./arr2/mdi_arrow-down-bold.png'))
                                        }}
                                    >
                                        <Image source={require('./arr2/mdi_arrow-down-bold.png')} style={{width:40, height:40}}/>
                                    </TouchableOpacity>


                                    <TouchableOpacity
                                        onPress={()=> {
                                            this.selectArrow(require('./arr2/mdi_arrow-down-bold-5.png'))
                                        }}
                                    >
                                        <Image source={require('./arr2/mdi_arrow-down-bold-5.png')} style={{width:40, height:40}}/>
                                    </TouchableOpacity>
                                </View>

                            </View>

                        </View>
                    </View>

                }
            </SafeAreaView>

        )
    }






}
