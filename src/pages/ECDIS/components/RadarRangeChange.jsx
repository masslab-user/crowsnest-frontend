import React from "react"
import { useFormik } from "formik"
import * as yup from "yup"
import { Grid, TextField, Stack, Button } from "@mui/material"
import { useRecoilState } from "recoil"
import { AtomShoreRadarSetting } from "../../../recoil/atoms"

const validationSchema = yup.object({
  range_change: yup.number().required("Required"),
})

const initFormValuesManual = {
  range_change: 500,
}

export default function RadarRangeChange() {
  const [shoreRadarRangeChange, setShoreRadarRangeChange] = useRecoilState(AtomShoreRadarSetting)

  const formik = useFormik({
    validationSchema: validationSchema,
    initialValues: shoreRadarRangeChange,

    onChange: values => {
      onFormChange(values)
    },
    onSubmit: values => {
      onFormSubmit(values)
    },
  })

  const onFormChange = values => {
    console.log("Change", values)
    setShoreRadarRangeChange( values)
  }

  const onFormSubmit = values => {
    console.log("Submit", values)
    setShoreRadarRangeChange(values)
  }

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          id="range_change"
          label="Shore Range Change "
          type="number"
          variant="filled"
          size="small"
          defaultValue={formik.values.range_change}
          onChange={formik.handleChange}
          error={formik.touched.range_change && Boolean(formik.errors.range_change)}
          helperText={formik.touched.range_change && formik.errors.range_change}
        />
        <Button type="submit" variant="contained" color="success" sx={{ marginTop: "0.4rem" }}>
          Submit
        </Button>
      </form>
    </div>
  )
}
