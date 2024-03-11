import axios from 'axios';

//token Clientify (se remplaza en cada cuenta nueva)
const token = "9ea36e0237e45db8581e45546b9a5474a701556f"; //solo reemplazar lo que esta entre colimmas, no toquen las comillas, abajo dejo un ejemplo
//const authToken = 'TOKEN-AQUI';


if (!token) {
  console.error('Token de autorización no proporcionado. Asegúrate de configurar la variable de entorno CLIENTIFY_TOKEN.');
  process.exit(1);
}

const processedContacts = new Set();

const getCurrentDate = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const threeDaysAgo = new Date();
threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);
const formattedThreeDaysAgo = threeDaysAgo.toISOString().split('T')[0];

const configWithDateFilter = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://api.clientify.net/v1/contacts/',
  params: {
    created_after: formattedThreeDaysAgo,
  },
  headers: {
    'Authorization': `Token ${token}`
  }
};

const isDateWithinLast3Days = (currentDate, contactDate) => {
  const today = new Date(currentDate);
  const contactCreatedDate = new Date(contactDate.split('T')[0]);
  const timeDifference = today.getTime() - contactCreatedDate.getTime();
  const daysDifference = timeDifference / (1000 * 3600 * 24);
  return daysDifference <= 3;
};

const displayContactInfo = (contact) => {
  console.log(`Nombre: ${contact.first_name} ${contact.last_name}`);
  console.log(`Número de contacto: ${contact.phones && contact.phones.length > 0 ? contact.phones[0].phone : 'N/A'}`);
  console.log(`E-mail: ${contact.emails && contact.emails.length > 0 ? contact.emails[0].email : 'notiene@lavanderialavafam.com'}`);
  console.log(`Dirección: ${contact.addresses && contact.addresses.length > 0 ? contact.addresses[0].street : 'N/A'}, ${contact.addresses && contact.addresses.length > 0 ? contact.addresses[0].city : 'N/A'}, ${contact.addresses && contact.addresses.length > 0 ? contact.addresses[0].state : 'N/A'}, ${contact.addresses && contact.addresses.length > 0 ? contact.addresses[0].country : 'N/A'}`);
  console.log(`Tags: ${contact.tags && contact.tags.length > 0 ? contact.tags.join(', ') : 'N/A'}`);
  console.log(`Fecha de creación: ${contact.created}`);
  const numeroApartamentoField = contact.custom_fields.find(field => field.field === 'Numero de apartamento');
  const numeroApartamento = numeroApartamentoField ? numeroApartamentoField.value : 'N/A';
  console.log(`Número de apartamento: ${numeroApartamento}`);

};

const fetchDataAndPost = async () => {
  try {
    const response = await axios(configWithDateFilter);
    const contacts = response.data.results;

    const currentDate = getCurrentDate();
    const pruebaContacts = contacts.filter(contact =>
      contact.tags && contact.tags.includes('cliente_nuevo_lavafan') && isDateWithinLast3Days(currentDate, contact.created)
    );

    pruebaContacts.forEach(async (contact) => {
      // Verifica si el contacto ya ha sido procesado antes de mostrar la información
      if (!processedContacts.has(contact.id)) {
        displayContactInfo(contact);
        processedContacts.add(contact.id);

        if (contact.addresses && contact.addresses.length > 0) {
          let numeroApartamento = 'N/A'; // Declarar numeroApartamento aquí

          const numeroApartamentoField = contact.custom_fields.find(field => field.field === 'Numero de apartamento');
          numeroApartamento = numeroApartamentoField ? numeroApartamentoField.value : 'N/A';

          const customerAddress = {
            street: contact.addresses && contact.addresses.length > 0 ? contact.addresses[0].street : 'N/A',
            apartment: numeroApartamento,
            city: contact.addresses && contact.addresses.length > 0 ? contact.addresses[0].city : 'N/A',
            state: contact.addresses && contact.addresses.length > 0 ? contact.addresses[0].state : 'N/A',
            country: contact.addresses && contact.addresses.length > 0 ? contact.addresses[0].country : 'N/A'
          };

          const formattedCustomerAddress = `${customerAddress.street}, apt: ${customerAddress.apartment}, ${customerAddress.city}, ${customerAddress.state}, ${customerAddress.country}`;

         

          const postConfig = {
            method: 'POST',
            url: 'https://cleancloudapp.com/api/addCustomer',
            headers: {
              'Content-Type': 'application/json'
            },
            data: {
              

              //token Clean Cloud (se remplaza en cada cuenta nueva)
              api_token: '1d1132d976e9b68ba0ae528596771783e91aa9c1',//solo reemplazar lo que esta entre colimmas, no toquen las comillas, abajo dejo un ejemplo
              //const authToken = 'TOKEN-AQUI';


              customerName: `${contact.first_name}`,
              customerTel: contact.phones && contact.phones.length > 0 ? contact.phones[0].phone : '',
              customerEmail: contact.emails && contact.emails.length > 0 ? contact.emails[0].email : '',
            customerAddress: `${contact.addresses[0].street}, ${numeroApartamento}, ${contact.addresses[0].city}, ${contact.addresses[0].state} `,
            customerAddressInstructions: formattedCustomerAddress,
            addressDetailed: {
              street:` ${contact.addresses[0].street}`,
              unit: `${numeroApartamento}`,
              city: `${contact.addresses[0].city}`,
              zip:'' ,
              state: `${contact.addresses[0].state}`
            },
              customerNotes: 'Envio de cliente desde clientify',
            }
          };
          

          try {
            console.log('Enviando solicitud POST a cleancloudapp.com...');
            const postResponse = await axios(postConfig);
            console.log('Solicitud POST enviada con éxito:');
            console.log('Status:', postResponse.status);
            console.log('Response:', postResponse.data);
          } catch (error) {
            console.error('Error en la solicitud POST a cleancloudapp.com:', error);
          }
        } else {
          console.log('El contacto no tiene dirección, no se realizará la solicitud POST.');
        }
      }
    });


  } catch (error) {
    console.error('Error al obtener datos desde Clientify API:', error);
  }
};



setInterval(async () => {
  console.log('Ejecutando fetchDataAndPost...');
  await fetchDataAndPost();
}, 60 * 500);
