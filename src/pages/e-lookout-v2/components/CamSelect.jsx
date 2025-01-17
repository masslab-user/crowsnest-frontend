import React from "react"
import { Button } from "@mui/material"
import mqtt from "precompiled-mqtt"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import "@tensorflow/tfjs"
// eslint-disable-next-line
import * as cocoSsd from "@tensorflow-models/coco-ssd"

function text2Binary(string) {
  return string
    .split("")
    .map(function (char) {
      return char.charCodeAt(0).toString(2)
    })
    .join(" ")
}

export default function CamSelect({ refV, refA, detectFrame, ID }) {
  const startCamera = camID => {
    refV.onplay = () => {
      console.log("playing")
    }

    refV.current.addEventListener("play", event => {
      event
      const modelPromise = cocoSsd.load()
      // modelPromise.detect()
      Promise.all([modelPromise, refV])
        .then(values => {
          detectFrame(refV.current, values[0])
        })
        .catch(error => {
          console.error(error)
        })
    })

    console.log("(1) start camera: " + camID)

    /* eslint-disable */
    const options = {
      // Clean session
      connectTimeout: 30000,
      // Auth
      clientId: "muppetA" + Math.random(),
      username: process.env.REACT_APP_MQTT_USERNAME,
      password: process.env.REACT_APP_MQTT_PASSWORD,
      protocolVersion: 5,
    }
    /* eslint-enable */

    let pc = null
    const requestTopic = "CROWSNEST/LANDKRABBA/WEBRTC/" + camID
    var config = {
      sdpSemantics: "unified-plan",
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }], // Always use a STUN server for ICE
    }

    // MQTT
    let client = mqtt.connect("wss://crowsnest.mo.ri.se:443/mqtt", options)
    pc = new RTCPeerConnection(config)

    // connect audio / video
    pc.addEventListener("track", function (evt) {
      console.log("#", evt)

      if (evt.track.kind == "video") {
        refV.current.srcObject = evt.streams[0]
        console.log("V2", refV.current.srcObject)
      } else {
        refA.current.srcObject = evt.streams[0]
      }
    })

    pc.addTransceiver("video", { direction: "recvonly" })
    pc.addTransceiver("audio", { direction: "recvonly" })

    pc.createOffer()
      .then(function (offer) {
        console.log("offer", offer)
        return pc.setLocalDescription(offer)
      })
      .then(function () {
        // wait for ICE gathering to complete
        return new Promise(function (resolve) {
         
          if (pc.iceGatheringState === "complete") {
        
            resolve()
          } else {
            // eslint-disable-next-line no-inner-declarations
            function checkState() {
              if (pc.iceGatheringState === "complete") {
                pc.removeEventListener("icegatheringstatechange", checkState)
                resolve()
              }
            }

            pc.addEventListener("icegatheringstatechange", checkState)
          }
        })
      })
      .then(function () {
      
        var offer = pc.localDescription
        var payload = JSON.stringify({
          sdp: offer.sdp,
          type: offer.type,
        })

        var responseTopic = "muppetR" + Math.random()
        console.log("responseTopic", responseTopic)

        client.on("message", function (topic, message) {
          console.log("Humm..message ", topic, message)

          client.unsubscribe(responseTopic)
          pc.setRemoteDescription(JSON.parse(message.toString()))
        })
        client.subscribe(responseTopic)

        client.publish(requestTopic, payload, {
          properties: {
            responseTopic: responseTopic,
            correlationData: text2Binary("hej"),
          },
        })
      })
      .catch(function (e) {
        // alert(e)
        console.log(e)
      })

    // client.on("error". )
  }

  return (
    <div>
      <Button onClick={() => startCamera(ID)}>
        <ArrowUpwardIcon sx={{ transform: "rotate(-90deg)" }} />
      </Button>
    </div>
  )
}
