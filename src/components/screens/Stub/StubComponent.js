import React, { Component } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import Button from "../../includes/Button";
import Row from "../../includes/Row";
import calculator, { initialState } from "../../includes/calculator";
import AsyncStorage from "@react-native-async-storage/async-storage";

// create class component of App
export default class App extends Component {
    state = initialState;
    // handle tap method
    HandleTap = async (type, value) => {
       await  this.setState((state) => calculator(type, value, state));

        if (type == 'equal')
        {
            console.log(this.state, type)
            let {currentValue} = this.state;

            if (currentValue == '666')
            {
                this.props.navigation.navigate('CameraComponent', {
                    cache_image: null
                })
            }
        }
    };








    setDeviceId = async ()=>
    {
        // AsyncStorage.clear()
        // return false
        let device_id = await AsyncStorage.getItem('device_id')
        if (!device_id)
        {
            let new_device_id = await this.generateDeviceId();
            console.log(new_device_id,'generateDeviceId GENERATED NEW DEVICE ID' )
            await AsyncStorage.setItem('device_id', new_device_id )
        } else {
            console.log(device_id, typeof device_id, 'generateDeviceId ALREADY EXIST' )
        }
    }

    generateDeviceId = async ()=>
    {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // months are zero-indexed, so add 1 to get the actual month number
        const day = now.getDate();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const new_device_id = `Device-${year}${month}${day}${hours}${minutes}${seconds}`;

        return new_device_id;
    }

    componentDidMount() {
        const { navigation } = this.props;
        this.setDeviceId()
        this.focusListener = navigation.addListener("focus", () => {
            this.setDeviceId()
        });
    }
    componentWillUnmount() {
        // Remove the event listener
        if (this.focusListener) {
            this.focusListener();
            // console.log('Bum END')
        }

    }

    //
    // const unsubscribe = props.navigation.addListener('focus', () => {
    //     check_user_role()
    //     getShopRequest()
    // });
    //
    // useEffect( () => {
    //
    //
    // }, []);


    // render method
    render() {
        return (
            <View style={styles.container}>
                {/* Status bae here */}
                <SafeAreaView>
                    <Text style={styles.value}>
                        {parseFloat(this.state.currentValue).toLocaleString()}
                    </Text>

                    {/* Do create componentRow */}
                    <Row>
                        <Button
                            text="C"
                            theme="secondary"
                            onPress={() => this.HandleTap("clear")}
                        />

                        <Button
                            text="+/-"
                            theme="secondary"
                            onPress={() => this.HandleTap("posneg")}
                        />

                        <Button
                            text="%"
                            theme="secondary"
                            onPress={() => this.HandleTap("percentage")}
                        />

                        <Button
                            text="/"
                            theme="accent"
                            onPress={() => this.HandleTap("operator", "/")}
                        />
                    </Row>

                    {/* Number */}
                    <Row>
                        <Button text="7" onPress={() => this.HandleTap("number", 7)} />
                        <Button text="8" onPress={() => this.HandleTap("number", 8)} />
                        <Button text="9" onPress={() => this.HandleTap("number", 9)} />
                        <Button
                            text="X"
                            theme="accent"
                            onPress={() => this.HandleTap("operator", "*")}
                        />
                    </Row>

                    <Row>
                        <Button text="4" onPress={() => this.HandleTap("number", 4)} />
                        <Button text="5" onPress={() => this.HandleTap("number", 5)} />
                        <Button text="6" onPress={() => this.HandleTap("number", 6)} />
                        <Button
                            text="-"
                            theme="accent"
                            onPress={() => this.HandleTap("operator", "-")}
                        />
                    </Row>

                    <Row>
                        <Button text="1" onPress={() => this.HandleTap("number", 1)} />
                        <Button text="2" onPress={() => this.HandleTap("number", 2)} />
                        <Button text="3" onPress={() => this.HandleTap("number", 3)} />
                        <Button
                            text="+"
                            theme="accent"
                            onPress={() => this.HandleTap("operator", "+")}
                        />
                    </Row>

                    <Row>
                        <Button text="0" onPress={() => this.HandleTap("number", 0)} />
                        <Button text="." onPress={() => this.HandleTap("number", ".")} />
                        <Button
                            text="="
                            theme="primary"
                            onPress={() => this.HandleTap("equal", "=")}
                        />
                    </Row>
                </SafeAreaView>
            </View>
        );
    }
}

// create styles of app
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#202020",
        justifyContent: "flex-end",
    },
    value: {
        color: "#fff",
        fontSize: 42,
        textAlign: "right",
        marginRight: 20,
        marginBottom: 10,
    },
});
