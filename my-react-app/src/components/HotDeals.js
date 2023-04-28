import React, { useEffect, useState } from "react";
import axios from 'axios'
import { TextField, Button, Link } from '@mui/material';



import "primereact/resources/primereact.min.css";
import { TabView, TabPanel } from 'primereact/tabview';
import "primereact/resources/themes/rhea/theme.css"

import 'primeicons/primeicons.css';


import { Sidebar } from 'primereact/sidebar';



const url = "http://localhost:1050/"
// const img="my-react-app\public\"

export default function HotDeals() {


    const [data, updateData] = useState([])
    const [messages, updateMessage] = useState({
        successMessage: "",
        errorMessage: ""
    })

    const [index, updateIndex] = useState(0)
    const [sidebar, updateSidebar] = useState(false)
    const [selectedPackage, updateSelectedPackage] = useState()
    const [bookForm, updateBookForm] = useState({
        noOfTravelers: "1",
        date: "",
        includeFlight: false,
    })
    const [formErrors, updateFormErrors] = useState({
        noOfTravelersError: "",
        dateError: "",
    })

    const [formValid, updateFormValid] = useState({
        noOfTravelersValid: false,
        dateValid: false,
        button: false
    })
    const [formErrorMessages, updateFormErrorMessages] = useState({
        successMsg: "",
        errorMsg: ""
    })
    const [totalCost, updateTotalCost] = useState("")
    const [endDate, updateEndDate] = useState("")

    useEffect(() => {
        fetchData()
    }, [])

    let fetchData = () => {
        axios.get(url + 'hotDeals').then((res) => {
            updateData(res.data)
            updateMessage({ ...messages, errorMessage: "" })
        }).catch((err) => {
            updateData([])
            updateMessage({ ...messages, errorMessage: err.response.data.message })
        })
    }

    let viewPackage = (singlePackage) => {
        updateIndex(0)
        updateSidebar(true)
        updateSelectedPackage(singlePackage)
        // console.log(selectedPackage.chargesPerPerson);
    }

    let book = (singlePackage) => {
        updateIndex(2)
        updateSidebar(true)
        updateSelectedPackage(singlePackage)
    }
    let handleChange = (e) => {
        var name = e.target.name
        var value

        if (e.target.checked) {
            value = e.target.checked
        }
        else {
            value = e.target.value
        }

        // console.log(e.target.checked);
        let formCopy = { ...bookForm }
        formCopy[name] = value
        updateBookForm(formCopy)
        validateBookForm(name, value)
    }
    let validateBookForm = (name, value) => {
        let formErrorCopy = { ...formErrors }
        let formValidCopy = { ...formValid }
        switch (name) {
            case 'noOfTravelers':
                if (!value) {
                    formErrorCopy.noOfTravelersError = "This field can't be empty!"
                    formValidCopy.noOfTravelersValid = false
                }
                else if (value < 1 || value > 5) {
                    formErrorCopy.noOfTravelersError = "No. of persons can't be more than 5 and less than 1."
                    formValidCopy.noOfTravelersValid = false
                }
                else {
                    formErrorCopy.noOfTravelersError = ""
                    formValidCopy.noOfTravelersValid = true
                }
                break
            case 'date':
                let date = new Date(value).setHours(0, 0, 0, 0)
                let today = new Date().setHours(0, 0, 0, 0)
                if (!value) {
                    formErrorCopy.dateError = "This field can't be empty!"
                    formValidCopy.dateValid = false
                }
                else if (date < today) {
                    formErrorCopy.dateError = "Please select future date!"
                    formValidCopy.dateValid = false
                }
                else {
                    formErrorCopy.dateError = ""
                    formValidCopy.dateValid = true
                }
                break

        }
        formValidCopy.button = formValidCopy.noOfTravelersValid && formValidCopy.dateValid
        updateFormErrors(formErrorCopy)
        updateFormValid(formValidCopy)
    }

    let handleSubmit = (e) => {
        e.preventDefault()
        calculateCharges()
    }
    let calculateCharges = () => {
        if (selectedPackage.availability < bookForm.noOfTravelers) {
            let msg = "Sorry we can only accomodate" + selectedPackage.availability + "Passengers"
            updateFormErrorMessages({ ...formErrorMessages, errorMsg: msg })
        }
        else {
            if (bookForm.includeFlight === true) {
                let bc = selectedPackage.chargesPerPerson * Number(bookForm.noOfTravelers)
                let total_cost = bc + (Number(bookForm.noOfTravelers) * selectedPackage.flightCharges)
                updateTotalCost(total_cost)
            }
            else {
                let bc = selectedPackage.chargesPerPerson * Number(bookForm.noOfTravelers)
                updateTotalCost(bc)
            }

        }
        let startDate = new Date(bookForm.date)
        let onedayMs = 24 * 60 * 60 * 1000
        let timeMs = startDate.getTime() + (selectedPackage.noOfNights * onedayMs);
        let endDate = new Date(timeMs).toDateString()
        updateEndDate(endDate)
    }
    let hideTab = () => {
        updateSidebar(false)
        defaultBookingForm()
    }
    let defaultBookingForm = () => {

        let bForm = {
            noOfTravelers: '1',
            date: '',
            includeFlight: false
        }
        let bformError = {
            noOfTravelersError: "",
            dateError: ""
        }
        let formValidCopy = {
            noOfTravelersValid: false,
            dateValid: false,
            button: false
        }
        updateTotalCost("")
        updateEndDate("")
        updateBookForm(bForm)
        updateFormErrors(bformError)
        updateFormValid(formValidCopy)
    }

    console.log(selectedPackage);
    return (


        <div>
            {sidebar ?
                <Sidebar visible={sidebar} className="p-sidebar-lg bg-white" position="right" onHide={hideTab} style={{ overflow: 'scroll' }}>
                    <h2>{selectedPackage.name}</h2>

                    <TabView activeIndex={index} onTabChange={(e) => updateIndex(e.index)} className="p-tabview" >
                        <TabPanel header="Overview">
                            <div className="row">
                                <div className="col-md-5">
                                    <img className="package-image img-fluid" src={process.env.PUBLIC_URL + selectedPackage.imageUrl} alt="image"></img>

                                </div>

                                <div className="col-md-7">
                                    <h4>Package Includes:</h4>
                                    <ul>
                                        {selectedPackage.details.itinerary.packageInclusions.map((data, index) => {

                                            return <li>{data}</li>

                                        })}
                                    </ul>
                                </div>
                            </div>
                            <div className="text-justify itineraryAbout">
                                <h4>Tour Overview</h4>
                                {selectedPackage.details.about}
                            </div>

                            {/* <div className="text-justify itineraryAbout">
                                <h4>Tour Overview:</h4>
                                {selectedPackage.details.about}
                            </div> */}
                        </TabPanel>
                        <TabPanel header="Itinerary">
                            <dv className="row">
                                <h4>Day Wise Itinerary</h4>
                                <h6>Day 1</h6>
                                <p>{selectedPackage.details.itinerary.dayWiseDetails.firstDay}</p>
                                {selectedPackage.details.itinerary.dayWiseDetails.restDaysSightSeeing.map((data, index) => {
                                    return <React.Fragment>
                                        <h6>Day {index + 2}</h6>
                                        <p>{data}</p>
                                    </React.Fragment>

                                })}
                                <h6>Day {selectedPackage.details.itinerary.dayWiseDetails.restDaysSightSeeing.length + 2}</h6>
                                <p>{selectedPackage.details.itinerary.dayWiseDetails.lastDay}</p>
                                <span className="text-danger"> **This itinerary is just a suggestion, itinerary can be modified as per requirement.<Link href="contactUs">Contact us</Link> for more details.</span>
                            </dv>
                        </TabPanel>
                        <TabPanel header="Book">
                            <div className="row">
                                <h3 className="itenaryAbout text-success">** Charge Per Person: ₹ {selectedPackage.chargesPerPerson}</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="noOftravelers">Number of Travelers</label>
                                        <input value={bookForm.noOfTravelers} type="number" className="form-control" onChange={handleChange} name="noOfTravelers" ></input>
                                        <span className="text-danger">{formErrors.noOfTravelersError}</span>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="date">Trip Start Date</label>
                                        <input value={bookForm.date} type="date" className="form-control" onChange={handleChange} name="date"></input>
                                        <span className="text-danger">{formErrors.dateError}</span>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="includeFlight">Include Flight </label>&nbsp;
                                        <input type="checkbox" onChange={handleChange} className="form-check-input" name="includeFlight"></input>
                                    </div>
                                   
                                   <button type="submit" className="btn btn-primary btn-lg" disabled={!formValid.button}>Calculate Charges</button>
                                 <div className="m-2">
                              {totalCost?
                                <h4 className="text-success">Your trip ends on {endDate} and you have to pay ₹ {totalCost}</h4>
                              :
                              <span className="text-danger">**Charges Exclude flight charges.</span>
                              }
                              </div>
                                </form>
                                <div className="text-center">
                                    <button className="btn btn-success"disabled={!totalCost}>Book</button> &nbsp; &nbsp; &nbsp;
                                    <button className="btn btn-link" onClick={hideTab}>Cancel</button>
                                </div>
                                <span className="text-danger">{formErrorMessages.errorMsg}</span>
                            </div>
                        </TabPanel>
                    </TabView>

                </Sidebar>

                : null
            }
            <div className="container-fluid">

                {data.map((singlePackage, index) => {


                    return <div className="card m-5" key={index}>
                        <div className="card-body p-5">
                            <div className="row ">
                                <div className="col-md-4 ">

                                    <img className="package-image img-fluid" src={process.env.PUBLIC_URL + singlePackage.imageUrl} alt="image"></img>
                                </div>
                                <div className="col-md-5">


                                    <div className="featured-text text-lg-left">
                                        <h4>{singlePackage.name}</h4>
                                        <div className="badge bg-info">{singlePackage.noOfNights}<em> Nights</em></div>
                                        {singlePackage.discount ? <div className="discount text-danger">{singlePackage.discount}% Instant Discount</div> : null}
                                        <p className="text-dark mb-0">{singlePackage.details.about}</p>
                                    </div>
                                    <br />
                                </div>
                                <div className="col-md-3">
                                    <h4>Prices Starting From:</h4>
                                    <div className="text-center text-success"><h6>₹ {singlePackage.chargesPerPerson}</h6></div><br /><br />
                                    <div>
                                        <Button

                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            onClick={() => viewPackage(singlePackage)}
                                        >
                                            View Details

                                        </Button></div>
                                    {/* <div><button className="btn btn-primary book" onClick={() => this.getItinerary(singlePackage)}>View Details</button></div><br /> */}
                                    {/* <div><br/><button className="btn btn-primary book" onClick={() => this.openBooking(singlePackage)}>Book </button>  </div> */}
                                    <div><br />
                                        <Button

                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            onClick={() => book(singlePackage)}
                                        >
                                            Book
                                        </Button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                })}
            </div>

        </div>
    )
}

