import React, { useState, useEffect } from "react"
import axios from "axios"
import * as yup from "yup"
import { useFormik } from "formik"
import { Stack, TextField, Button, Typography } from "@mui/material"
import { atomKeelsonConnectionState } from "../../../recoil/atoms"
import { protoParser, messageParser } from "../../../recoil/selectors"
import { useSetRecoilState } from "recoil"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import StopIcon from "@mui/icons-material/Stop"
import protobuf from "protobufjs"
import envelope from "../../../proto/envelope.proto"
import ByteBuffer from "bytebuffer"
import primitives from "../../../proto/primitives.proto"

export default function KeelsonGetLoop() {
  const [intervalVar, setIntervalVar] = useState(null)
  const [isStarted, setIsStarted] = useState(false)
  const parseKeelsonMsg = useSetRecoilState(protoParser)
  const msgParser = useSetRecoilState(messageParser)

  useEffect(() => {
    console.log("KeelsonGetLoop mounted")

    return () => {
      console.log("KeelsonGetLoop unmounted")
    }
  }, [])

  const validationSchema = yup.object({
    hostLoop: yup.string().required("Required"),
    keyExprLoop: yup.string().required("Required"),
  })

  /* eslint-disable */
  const initFormValuesManual = {
    // username: process.env.REACT_APP_MQTT_USERNAME ? process.env.REACT_APP_MQTT_USERNAME : "",
    // password: process.env.REACT_APP_MQTT_PASSWORD ? process.env.REACT_APP_MQTT_PASSWORD : "",
    hostLoop: "http://10.10.7.2:8000",
    // hostLoop: "http://localhost:8000",
    keyExprLoop: "rise/masslab/**",
  }
  /* eslint-enable */

  const formik = useFormik({
    validationSchema: validationSchema,
    initialValues: initFormValuesManual,
    onSubmit: values => {
      submitMsg(values)
    },
  })

  const submitMsg = values => {
    console.log("Submit", values)
    const URL = values.hostLoop + "/" + values.keyExprLoop

    const interval = setInterval(() => {
      axios.get(URL).then(res => {
        let time = new Date()
        console.log("Loop Response: ", time, res)

        res.data.forEach(keelsonDataPack => {
          // console.log("Loop Response: ", keelsonDataPack)
          
          const keyExp = keelsonDataPack.key
          
          // Open Envelope
          const payload = keelsonDataPack.value
          let bytes = new Uint8Array(ByteBuffer.fromBase64(payload).toArrayBuffer())
          
          protobuf.load(envelope, function (err, root) {
            if (err) throw err
            // Get a reference to your message type
            const Envelope = root.lookupType("core.Envelope")
            
            // Decode the buffer back into a message
            const decodedMessage = Envelope.decode(bytes)


            switch(keyExp) {
              case keyExp.match(/^rise\/masslab\/haddock\/masslab-5\/lever_position_pct\/arduino\/right\/azimuth\/vertical/)?.input: {
                console.log("Acceleration")

                protobuf.load(primitives, function (err, root) {
                  // Get a reference to your message type
                  const PrimitivesTimeFloat = root.lookupType("brefv.primitives.TimestampedFloat")
                  
                  const readable = PrimitivesTimeFloat.decode(decodedMessage.payload)
                  
                  console.log(keyExp);
                  console.log("readable", readable)

                  msgParser({topic: keyExp, payload: readable})
                })
              
                break;
              }
            } // Switch END
            
        
          })
        })
      })
    }, 1000)

    setIntervalVar(interval)
    setIsStarted(true)
    // return values
  }

  function stopLoop() {
    console.log("Stopping loop")
    clearInterval(intervalVar)
    setIsStarted(false)
  }

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={1} sx={{ minWidth: "25vw" }}>
          <Typography variant="h5"> Keelson GET Looper </Typography>
          <TextField
            id="hostLoop"
            label="Host URL"
            fullWidth
            variant="filled"
            size="small"
            defaultValue={formik.values.hostLoop}
            onChange={formik.handleChange}
            error={formik.touched.hostLoop && Boolean(formik.errors.hostLoop)}
            helperText={formik.touched.hostLoop && formik.errors.hostLoop}
          />
          <TextField
            id="keyExprLoop"
            label="Key Expression & Variables"
            fullWidth
            variant="filled"
            size="small"
            defaultValue={formik.values.keyExprLoop}
            onChange={formik.handleChange}
            error={formik.touched.keyExprLoop && Boolean(formik.errors.keyExprLoop)}
            helperText={formik.touched.keyExprLoop && formik.errors.keyExprLoop}
          />

          {isStarted ? null : (
            <Button type="submit" variant="contained" color="info" fullWidth sx={{ marginTop: "0.4rem" }}>
              <PlayArrowIcon sx={{ marginRight: "0.2rem" }} />
              Start
            </Button>
          )}
        </Stack>
      </form>

      {isStarted ? (
        <Button onClick={stopLoop} variant="contained" color="info" fullWidth sx={{ marginTop: "0.4rem" }}>
          <StopIcon sx={{ marginRight: "0.2rem" }} />
          Stop
        </Button>
      ) : null}
    </div>
  )
}
