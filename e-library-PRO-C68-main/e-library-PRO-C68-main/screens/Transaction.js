import React, { Component } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ImageBackground,
  TextInput,
  Alert,
  ToastAndroid,
  KeyboardAvoidingView
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import db from "../config";
import firebase from "firebase";

const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

export default class TransactionScreen extends Component {
    constructor (props){
    super (props);
    this.state = {
    domState: "normal",
    hasCameraPermissions: null,
    scanned: false,
    bookId: "",
    studentId: ""
  };
}

getCameraPermissions = async domState => {
  const { status } = await Permissions.askAsync(Permissions.CAMERA);

  this.setState({
  /*status === "granted" is true when user has granted permission
  status === "granted" is false when user has not granted the permission
  */
  hasCameraPermissions: status === "granted",
  domState: domState,
  scanned: false
});
};

handleBarCodeScanned = async ({ type, data }) => {
const { domState } = this.state;

if (domState === "bookId") {
  this.setState({
    bookId: data,
    domstate: "normal",
    scanned: true
  });
}else if (domState === "studentId") {
  this.setState({
    studentId: data,
    domState:"normal",
    scanned: true
  });
  }
 };

 handleTransaction = async () => {
  var { bookId, studentId } = this.state;
  await this.getBookDetails(bookId);
  await this.getStudentDetails(studentId);

  var transactionType = await this.checkBookAvailabilty(bookId);

  if(!transactionType) {
    this.setState({ bookId:"", studentId:""});
 // I had to leave to spaces coz i needed to be
 // on the same line as you so i dont get confused 
 // everytime you see this : * is means the same message :)
    Alert.alert("The book doesn't exist in the library database!");
  } else if (transactionType === " issue ") {
    var isEligible = await this.checkStudentEligibilityForBookIssue(
      studentId
    );

    if (isEligible) {
      var { bookName, studentName } = this.state;
      this.initiateBookIssue(bookId, studentId, bookName, studentName)
    }
    //*
    //*
    Alert.alert("Book issued to the student ");
  }else {
    var isEligible = await this.checkStudentEligibilityForBookReturn(
      bookId,
      studentId
    );

    if (isEligible) {
      var { bookName, studentName } = this.state;
      this.initaiateBookReturn(bookId, studentId, bookName, studentName);
    }
    //*
    //*
    Alert.alert("Book returned to the library!");
  }
  };
};


 initiateBookIssue = () => {
  console.log("Book issued to the student!");
 };

 initiateBookReturn = () => {
  console.log("Book returned to the library!");
 }; 

 render(){
  const {bookId, studentId, domState, scanned }= this.state;
  if (domState !== "normal") {
    return (
      <BarCodeScanner
      on BarCodeScanner ={ scanned ? undefined : this.handleBarCodeScanned}
      style={StyleSheet.absoluteFillObject}
      />
    );
  }
  return(
    <View style={style.container}>
      <ImageBackground source={bgImage} style={styles.bgImage}>
       <View style={styles.upperContainer}>
        <Image source={appIcon} style={styles.appIcon}/>
        <Image source={appName} style={styles.appName}/>
       </View>
       <View style={styles.lowerContainer}>
        <View style={styles.textInputContainer}>
          <TextInput
          style={styles.textinput}
          placeholder={"Book Id"}
          placeholderTextColor={"#FFFFFF"}
          value={bookId}
          />
          <TouchableOpacity
          style={styles.scanbutton}
          onPress={()  => this.getCameraPermissions("bookId")}
          >
            <Text style={styles.scanbuttonText}>Scan</Text>
          </TouchableOpacity>
          </View>
          <View style={[styles.textInputContainer, {marginTop: 25 }]}>
            <TextInput
            style={styles.textinput}
            placeholder={"Student Id "}
            placeholderTextColor={"#FFFFFF"}
            value={studentId}
            />
            <TouchableOpacity
            style={styles.scanbutton}
            onPress={() => this.getCameraPermissions(studentId)}
            >
              <Text style={styles.scanbuttonText}>Scan</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
           style={[styles.button, {marginTop: 25}]}
           onPress={this.handleTransaction}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
       </View>
      </ImageBackground>
    </View>
  );
}
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:"#FFFFFF"
  },
  bgImage:{
    flex:1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center"
  },
  upperContainer:{
    flex:0.5,
    justifyContent:"center",
    alignItems: "center"
  },
  appIcon:{
    width:200,
    height:200,
    resizeMode: "contain",
    marginTop: 80
  },
  appName:{
    width:80,
    height:80,
    resizeMode: "contain"
  },
  lowerContainer:{
    flex:0.5,
    alignItems: "center"
  },
  textInputContainer:{
    borderWidth:2,
    borderRadius:10,
    flexDirection: row,
    backgroundColor: "#9DFD24",
    borderColor: "#FFFFFF"
  },
  textinput:{
    width:"57%",
    height:50,
    padding:10,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "#Rajdhani_600SemiBold",
    color: "#FFFFFF"
  },
  scanbutton:{
    width: 100,
    height: 50,
    bakcgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  scanbuttonText:{
    fontSize: 24,
    color: "#0A0101",
    fontFamily: "#Rajdhani_600SemiBold"
  },
  button:{
    width: "43%",
    height: 55,
    justifyContent: "center",
    backgroundColor: "#F48D20",
    borderRadius: 15
  },
  buttonText:{
    fontSize: 24,
    color: "#FFFFFF",
    fontFamily: "#Rajdhani_600SemiBold" 
  }
})