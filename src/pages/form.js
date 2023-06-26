import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const FormPage = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const handleSubmit = (event) => {
    event.preventDefault();
  
    const myForm = event.target;
    const formData = new FormData(myForm);

    console.log(formData);
    
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    })
      .then(() => console.log("Form successfully submitted"))
      .catch((error) => alert(error));
  };
  return (
    <Layout location={location} title={siteTitle}>
      <Seo title="Form Test" />
      <h1>This a form test</h1>
      <p>This is a test form.</p>
      <form method="post" netlify-honeypot="bot-field" data-netlify="true" name="contact" onSubmit={handleSubmit}>
        <input type="hidden" name="bot-field" />
        <input type="hidden" name="form-name" value="contact" />
        <fieldset>
          <label for="firstname">First Name
          <input type="text" id="firstname" name="firstname"></input></label><br></br>
          <label for="lastname">Last Name
          <input type="text" id="lastname" name="lastname"></input></label><br></br>
          <label for="email">Email
          <input type="email" id="email" name="email"></input></label><br></br>
          <label for="phone">Phone
          <input type="text" id="phone" name="phone"></input></label><br></br>
          <label for="company">Company
          <input type="text" id="company" name="company"></input></label><br></br>
          <label for="address">Address
          <input type="text" id="address" name="address"></input></label><br></br>
          <label for="city">City
          <input type="text" id="city" name="city"></input></label><br></br>
          <label for="state">Province
          <input type="text" id="state" name="state"></input></label><br></br>
          <label for="zip">Postal Code
          <input type="text" id="zip" name="zip"></input></label><br></br>
          <input type="submit" value="Submit"></input><br></br>
        </fieldset>
      </form>
    </Layout>
  )
}

export default FormPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
