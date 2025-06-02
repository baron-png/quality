const axios = require('axios');
const fs = require('fs');

const tenantId = 'ade726ce-9d40-472b-a6cc-b24ba3cd7a31';
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJzdXBlcmFkbWluLWRpbWVuc2lvbnBsdXMiLCJyb2xlTmFtZXMiOlsiU1VQRVJfQURNSU4iXSwidGVuYW50SWQiOiJkaW1lbnNpb25wbHVzLmNvbSIsImlhdCI6MTc0NDE0NDg4NCwiZXhwIjoxNzQ0MTQ1Nzg0fQ.yAZs7gL8f8KNFy1AU-rhjuXac_0XC_IfxqtuPliEP3g'; // Replace with your actual admin JWT
const authHeader = { headers: { Authorization: `Bearer ${adminToken}` } };

// Sample departments with HODs
const departments = [
 
  { name: 'Agriculture and Environmental Sciences', code: 'AES', head: { firstName: 'Hannah', lastName: 'Wahome', email: 'hkwahome@karumotti.ac.ke' }},
  { name: 'Electrical and Electronics Engineering', code: 'EEE', head: { firstName: 'Kenjoy', lastName: 'Kathure', email: 'kenjoykathure@karumotti.ac.ke' }},
  { name: 'IM, Hospitality & Fashion and Design', code: 'IHF', head: { firstName: 'Caroline', lastName: 'Wanja', email: 'carol@karumotti.ac.ke' }},
  { name: 'Registry', code: 'REG', head: { firstName: 'Naomi', lastName: 'Njeri', email: 'naomie@karumotti.ac.ke' }},
  { name: 'Examination Office', code: 'EXAM', head: { firstName: 'Timothy', lastName: 'Mbaabu', email: 'timothymbaabu@karumotti.ac.ke' }},
  { name: 'IQA Department', code: 'IQA', head: { firstName: 'Joyce', lastName: 'Mbaya', email: 'joyce@karumotti.ac.ke' }},
  { name: 'ICT Department (Non-academic)', code: 'ICT', head: { firstName: 'Joseph', lastName: 'Kiriinya', email: 'kiriinya@karumotti.ac.ke' }},
  { name: 'HR Office', code: 'HR', head: { firstName: 'Rodah', lastName: 'Asigo', email: 'rasigo@karumotti.ac.ke' }},
  { name: 'Finance Department', code: 'FIN', head: { firstName: 'Faith', lastName: 'Kathure', email: 'fkathure@karumotti.ac.ke' }},
  { name: 'Procurement Department', code: 'PROC', head: { firstName: 'David', lastName: 'Gichunge', email: 'dgichunge@karumotti.ac.ke' }},
  { name: 'Dean of Students Office', code: 'DOS', head: { firstName: 'Joseph', lastName: 'Mithika', email: 'josephmithika@karumotti.ac.ke' }},
  { name: 'Guidance & Counselling', code: 'GC', head: { firstName: 'Leah', lastName: 'Osero', email: 'leahosero@karumotti.ac.ke' }},
  { name: 'Security', code: 'SEC', head: { firstName: 'Harun', lastName: 'Kiriinya', email: 'harunkiriinya@karumotti.ac.ke' }},
  { name: 'Projects implementation', code: 'PROJ', head: { firstName: 'Mathews', lastName: 'Nkarichia', email: 'mathewsnkarichia@karumotti.ac.ke' }},
  { name: 'Repair and Maintenance', code: 'RM', head: { firstName: 'Stephen', lastName: 'Muthuri', email: 'stevem@karumotti.ac.ke' }},
  { name: 'Management Representative Office', code: 'MR', head: { firstName: 'Dennis', lastName: 'Bangi', email: 'bangi@karumotti.ac.ke' }},
  { name: 'ILO', code: 'ILO', head: { firstName: 'Nicholas', lastName: 'Mutwiri', email: 'mutwirinicholas@karumotti.ac.ke' }},
  { name: 'Research & Development', code: 'RD', head: { firstName: 'Terah', lastName: 'Mugendi', email: 'terahm@karumotti.ac.ke' }},
  { name: 'Internal Audit Function', code: 'IAF', head: { firstName: 'Peterson', lastName: 'Kinyua', email: 'petersonkinyua@karumotti.ac.ke' }},
  { name: 'Library', code: 'LIB', head: { firstName: 'Alex', lastName: 'Omariba', email: 'alexomariba@karumotti.ac.ke' }},
  { name: 'Academics', code: 'ACA', head: { firstName: 'Alice', lastName: 'Mugaa', email: 'alicemugaa@karumotti.ac.ke' }},
  { name: 'Principal', code: 'PRIN', head: { firstName: 'Flora', lastName: 'Kanyua', email: 'florakanyua@karumotti.ac.ke' }},
  { name: 'Administrative Assistant', code: 'AA', head: { firstName: 'Glory', lastName: 'Makena', email: 'glorym@karumotti.ac.ke' }},
];

async function seedDepartments() {
  for (const dept of departments) {
    try {
      console.log(`Creating department: ${dept.name}`);

      const response = await axios.post(
        `http://localhost:5001/api/tenants/${tenantId}/departments`, // Updated to port 5001
        {
          name: dept.name,
          code: dept.code,
          head: {
            ...dept.head,
            password: 'Hod12345@', // You can customize or randomize this
          },
        },
        authHeader
      );

      console.log(`✅ Created: ${response.data.department.name}`);
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message;
      console.error(`❌ Failed to create ${dept.name}:`, errMsg);
    }
  }
}

seedDepartments();