import {
  IconButton,
  Stack,
  Typography,
  Box,
  Chip,
  ButtonGroup,
  Button,
  OutlinedInput,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material"
import React from "react"
import { useTheme } from "@mui/material/styles"
import ZoomOutIcon from "@mui/icons-material/ZoomOut"
import ZoomInIcon from "@mui/icons-material/ZoomIn"
import { atomMapState, atomMapSetting, atomLayersTaggable, atomLayersShowing, atomSensorLayersShowing, atomSensorLayersTaggable } from "./SeaChart"
import { useRecoilState, useRecoilValue } from "recoil"
import { OS_POSITIONS, OS_POSITION_SETTING } from "../../../recoil/atoms"
import RadarRangeChange from "./RadarRangeChange"
import RadarOSRangeChange from "./RadarOSRangeChange"

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

function getStyles(layersTaggable, name, theme) {
  return {
    fontWeight: layersTaggable.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
  }
}

export default function ChartControls() {
  const [mapState, setMapState] = useRecoilState(atomMapState)
  const [mapSetting, setMapSetting] = useRecoilState(atomMapSetting)
  const layersTaggable = useRecoilValue(atomLayersTaggable)
  const [layersShowing, setLayersShowing] = useRecoilState(atomLayersShowing)
  const sensorLayersTaggable = useRecoilValue(atomSensorLayersTaggable)
  const [sensorLayersShowing, setSensorLayersShowing] = useRecoilState(atomSensorLayersShowing)
  const osPos = useRecoilValue(OS_POSITIONS)
  const osPosSetting = useRecoilValue(OS_POSITION_SETTING)

  const zoomOut = () => {
    setMapState({
      ...mapState,
      zoom: mapState.zoom - 1,
    })
  }

  const zoomIn = () => {
    setMapState({
      ...mapState,
      zoom: mapState.zoom + 1,
    })
  }

  const setNorthUp = () => {
    setMapState({
      ...mapState,
      bearing: 0,
    })
  }

  const setHeadUp = () => {
    setMapState({
      ...mapState,
      bearing: 0,
    })
  }

  const setFreeUp = () => {
    setMapState({
      ...mapState,
      bearing: 0,
    })
  }

  const set2D = () => {
    setMapState({
      ...mapState,
      pitch: 0,
    })
  }

  const set3D = () => {
    setMapState({
      ...mapState,
      pitch: 75,
    })
  }

  const theme = useTheme()

  const handleChange = event => {
    const {
      target: { value },
    } = event
    setLayersShowing(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    )
  }

  const handleChangeSensorLayer = event => {
    const {
      target: { value },
    } = event
    setSensorLayersShowing(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    )
  }


  

  const setOsPosChartCenter = () => {
    setMapState({
      ...mapState,
      latitude: osPos[osPosSetting.source].latitude,
      longitude: osPos[osPosSetting.source].longitude,
    })
    setMapSetting({
      ...mapSetting,
      chartFix: "OS",
    })
  }

  const setOsPosChartManual = () => {
    setMapSetting({
      ...mapSetting,
      chartFix: "MANUAL",
    })
  }

  return (
    <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
      <Button onClick={setOsPosChartCenter} variant={mapSetting.chartFix === "OS" ? "contained" : "outlined"}>
        Center OS
      </Button>
      <Button onClick={setOsPosChartManual} variant={mapSetting.chartFix === "MANUAL" ? "contained" : "outlined"}>
        Manual
      </Button>

      <IconButton onClick={zoomOut}>
        <ZoomOutIcon />
      </IconButton>
      <Typography variant="subtitle1"> {mapState.zoom.toFixed(1)} </Typography>
      <IconButton onClick={zoomIn}>
        <ZoomInIcon />
      </IconButton>

      <ButtonGroup variant="outlined" aria-label="outlined button group" size="small">
        <Button onClick={setNorthUp}>N-UP</Button>
        <Button onClick={setHeadUp}>H-UP</Button>
        <Button onClick={setFreeUp}>FREE</Button>
      </ButtonGroup>

      <ButtonGroup variant="outlined" aria-label="outlined button group" size="small">
        <Button onClick={set2D}>2D</Button>
        <Button onClick={set3D}>3D</Button>
      </ButtonGroup>

      {/* MAP TILES SELECT */}
      <FormControl sx={{ width: 300 }} size="small">
        <InputLabel id="demo-multiple-chip-label">Chart Layers</InputLabel>
        <Select
          labelId="demo-multiple-chip-label"
          id="demo-multiple-chip"
          multiple
          value={layersShowing}
          onChange={handleChange}
          input={<OutlinedInput id="select-multiple-chip" label="Chart Layers" />}
          renderValue={selected => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map(value => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {layersTaggable.map(name => (
            <MenuItem key={name} value={name} style={getStyles(layersTaggable, name, theme)}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* SENSOR LAYERS SELECTOR */}
      <FormControl sx={{ width: 500 }} size="small">
        <InputLabel id="sensor-layer-chip-label">Sensor Layers</InputLabel>
        <Select
          labelId="sensor-layer-chip-label"
          id="sensor-layer-chip"
          multiple
          value={sensorLayersShowing}
          onChange={handleChangeSensorLayer}
          input={<OutlinedInput id="select-sensor-layer-chip" label="Chart Layers" />}
          renderValue={selected => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map(value => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {sensorLayersTaggable.map(name => (
            <MenuItem key={name} value={name} style={getStyles(sensorLayersTaggable, name, theme)}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Radar range shore radar */}
      <RadarRangeChange/>
      <RadarOSRangeChange/>
  

    </Stack>
  )
}
