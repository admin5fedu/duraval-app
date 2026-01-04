"use client"

import * as React from "react"
import { GPSLocationInput, type GPSLocationInputProps } from "./gps-location-input"

/**
 * GPS Location Form Field - Wrapper để tích hợp với react-hook-form
 * Component này sẽ được sử dụng như customComponent trong FormFieldConfig
 */
export const GPSLocationFormField = React.forwardRef<HTMLInputElement, GPSLocationInputProps>(
  function GPSLocationFormField(props, ref) {
    return <GPSLocationInput {...props} ref={ref} />
  }
)

GPSLocationFormField.displayName = "GPSLocationFormField"

