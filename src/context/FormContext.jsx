import React, { createContext, useState, useContext } from 'react';

// Create Context
const FormContext = createContext();

// Build the PROVIDER  
export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    // Step 1: Identity
    restaurantName: '', 
    openingDate: '', 
    ownerName: '', 
    ownerContact: '', 
    ownerAddress: '', 
    dob: '',

    // Step 2: Business Info
    category: 'Cafe', 
    website: '', 
    officeAddress: '', 
    resContact: '', 
    hasLicense: 'No',
    logo: null,       
    logoType: 'Photo', 

    // Step 3: Verification
    licenseNumber: '', 
    licenseFile: null,
    idType: 'NID', 
    idFormat: 'Photo', 
    idFileFront: null, 
    idFileBack: null, 
    idFilePdf: null,

    // Step 4 & 5: Security & OTP
    email: '', 
    password: '', 
    confirmPassword: '',
    otpMethod: 'email', 
    otpCode: ''        
  });

  const [isVerified, setIsVerified] = useState(false);

  // Function For DATA update
  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  return (
    <FormContext.Provider value={{ formData, updateFormData, isVerified, setIsVerified }}>
      {children}
    </FormContext.Provider>
  );
};

// Custom HOOK 
export const useFormContext = () => useContext(FormContext);