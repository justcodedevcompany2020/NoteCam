import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
// import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {AuthContext} from "../components/AuthContext/context";
import {StackActions} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import StubComponent from '../components/screens/Stub/StubComponent';
import CameraComponent from '../components/screens/Camera/CameraComponent';
import ImageRedactorComponent from '../components/screens/ImageRedactor/ImageRedactorComponent';
const Stack = createStackNavigator();





const RootNavigator = () => {

    const [isLoading, setIsLoading] = React.useState(true);
    const [userToken, setUserToken] = React.useState(null);

    const initialLoginState = {
        isLoading: true,
        userToken: null,
    };

    const loginReducer = (prevState, action) => {
        switch (action.type) {
            case 'RETRIEVE_TOKEN':
                return {
                    ...prevState,
                    userToken: action.token,
                    isLoading: false,
                };
            case 'LOGIN':
                return {
                    ...prevState,
                    userToken: action.token,
                    isLoading: false,
                };
            case 'LOGOUT':
                return {
                    ...prevState,
                    userName: null,
                    userToken: null,
                    isLoading: false,
                };
            case 'REGISTER':
                return {
                    ...prevState,
                    userName: action.id,
                    userToken: action.token,
                    isLoading: false,
                };
        }
    };

    const [loginState, dispatch] = React.useReducer(loginReducer, initialLoginState);

    const authContext = React.useMemo(() => ({
        signIn: async (foundUser, callback) => {
            setIsLoading(true);
            const userToken = String(foundUser.token);
            const user_data = foundUser.user_data;

            // setUserToken(userToken);

            console.log('user_data from app', user_data);
            console.log('user_data from app', typeof user_data);
            try {
                await AsyncStorage.setItem('userToken', userToken);
                await AsyncStorage.setItem('user_data', JSON.stringify(user_data));
                // await AsyncStorage.setItem('userId', userId);
            } catch (e) {
                console.log(e);
            }
            dispatch({type: 'LOGIN',  token: userToken});
            setIsLoading(false);
            callback();
        },
        signOut: async (callback) => {
            try {
                await AsyncStorage.removeItem('userToken');
                setIsLoading(false);

            } catch (e) {
                console.log(e);
            }
            dispatch({type: 'LOGOUT'});
            callback();
        },
        signUp: () => {
            // setIsLoading(false);
        }
    }), []);



    // Проверка при входе в приложение.
    React.useEffect(() => {

        setTimeout(async () => {
            // await AsyncStorage.removeItem('userToken', userToken);
            let userToken;
            userToken = null;
            try {
                userToken = await AsyncStorage.getItem('userToken');
                setIsLoading(false);
            } catch (e) {
                console.log(e);
            }
            dispatch({type: 'RETRIEVE_TOKEN', token: userToken});
        }, 2000);
    }, []);


    //
    // if (isLoading) {
    //     return (
    //         <View style={{flex:1, width: '100%'}}>
    //             <Image source={require('./assets/images/splashscreen.png')} style={{flex:1, width: '100%', height: '100%', resizeMode: 'cover'}}/>
    //         </View>
    //     )
    // }

    return (

        <AuthContext.Provider value={authContext}>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName='StubComponent'
                    screenOptions={{
                        headerShown: false,
                        animationEnabled: true,
                        detachPreviousScreen: true,
                        presentation: 'transparentModal'
                    }}
                >

                    <Stack.Screen
                        name="StubComponent"
                        component={StubComponent}
                        options={({route}) => ({
                            tabBarButton: () => null,
                            tabBarStyle: {display: 'none'},
                        })}
                    />

                    <Stack.Screen
                        name="ImageRedactorComponent"
                        component={ImageRedactorComponent}
                        options={({route}) => ({
                            tabBarButton: () => null,
                            tabBarStyle: {display: 'none'},
                        })}
                    />



                    <Stack.Screen
                        name="CameraComponent"
                        component={CameraComponent}
                        options={({route}) => ({
                            tabBarButton: () => null,
                            tabBarStyle: {display: 'none'},
                        })}
                    />

                </Stack.Navigator>

            </NavigationContainer>
        </AuthContext.Provider>
    );
};

export default RootNavigator;
