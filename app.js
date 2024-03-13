import axios from 'axios';

// Token de autorización de Clientify (se recomienda manejar como variable de entorno)
const token = "9ea36e0237e45db8581e45546b9a5474a701556f";

if (!token) {
    console.error('Token de autorización no proporcionado. Asegúrate de configurar la variable de entorno CLIENTIFY_TOKEN.');
    process.exit(1);
}

//const processedContacts = new Set();
const processedContacts = new Map(); // Usamos un Map en lugar de un Set para almacenar el contacto junto con sus etiquetas.


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
    console.log("----------------------------------------------------------")
};

const fetchDataAndPost = async () => {
    try {
        const response = await axios(configWithDateFilter);
        const contacts = response.data.results;

        const currentDate = getCurrentDate();
        const pruebaContacts = contacts.filter(contact =>
            isDateWithinLast3Days(currentDate, contact.created)
        );

        /*for (const contact of pruebaContacts) {
            if (!processedContacts.has(contact.id)) {
                displayContactInfo(contact);
                processedContacts.add(contact.id);*/
/*** */
                

for (const contact of pruebaContacts) {
    let processContact = true;
    if (processedContacts.has(contact.id)) {
        // Verificar si hay cambios en las etiquetas
        const oldContact = processedContacts.get(contact.id);
        if (oldContact.tags.join(',') === contact.tags.join(',')) {
            processContact = false; // No hay cambios en las etiquetas
        }
    }

    if (processContact) {
        displayContactInfo(contact);
        processedContacts.set(contact.id, contact);


                //SEDE LA COSA
                if (contact.tags && (contact.tags.includes('cleancloud_costa'))) {
                    let cleanCloudToken = '1d1132d976e9b68ba0ae528596771783e91aa9c1';

                    let numeroApartamento = 'N/A';
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
                            api_token: cleanCloudToken,
                            customerName: `${contact.first_name}`,
                            customerTel: contact.phones && contact.phones.length > 0 ? contact.phones[0].phone : '',
                            customerEmail: contact.emails && contact.emails.length > 0 ? contact.emails[0].email : '',
                            customerAddress: formattedCustomerAddress,
                            customerAddressInstructions: formattedCustomerAddress,
                            addressDetailed: {
                                street: customerAddress.street,
                                unit: customerAddress.apartment,
                                city: customerAddress.city,
                                zip: '',
                                state: customerAddress.state
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
                        console.error('Error en la solicitud POST a cleancloudapp.com:', error.response.data);
                    }
                    /******************************************************************** */


                    //SEDE BOGOTA
                } if (contact.tags && (contact.tags.includes('cleancloud_bogota'))) {

                    let cleanCloudToken = "888d4a8c4dc28fdfd09c3612535e770fbcb5960a";

                    if (!cleanCloudToken) {
                        console.error('Token de autorización no proporcionado. Asegúrate de configurar la variable de entorno CLIENTIFY_TOKEN.');
                        process.exit(1);
                    }

                    let numeroApartamento = 'N/A';
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
                            api_token: cleanCloudToken,
                            customerName: `${contact.first_name}`,
                            customerTel: contact.phones && contact.phones.length > 0 ? contact.phones[0].phone : '',
                            customerEmail: contact.emails && contact.emails.length > 0 ? contact.emails[0].email : '',
                            customerAddress: formattedCustomerAddress,
                            customerAddressInstructions: formattedCustomerAddress,
                            addressDetailed: {
                                street: customerAddress.street,
                                unit: customerAddress.apartment,
                                city: customerAddress.city,
                                zip: '',
                                state: customerAddress.state
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
                        console.error('Error en la solicitud POST a cleancloudapp.com:', error.response.data);
                    }

                    /******************************************************************** */

                    //SEDE CALI
                } if (contact.tags && (contact.tags.includes('cleancloud_cali'))) {

                    let cleanCloudToken = "4430ceceeee4ad477d5766f62f3c5af4b2ad9c5f";

                    if (!cleanCloudToken) {
                        console.error('Token de autorización no proporcionado. Asegúrate de configurar la variable de entorno CLIENTIFY_TOKEN.');
                        process.exit(1);
                    }

                    let numeroApartamento = 'N/A';
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
                            api_token: cleanCloudToken,
                            customerName: `${contact.first_name}`,
                            customerTel: contact.phones && contact.phones.length > 0 ? contact.phones[0].phone : '',
                            customerEmail: contact.emails && contact.emails.length > 0 ? contact.emails[0].email : '',
                            customerAddress: formattedCustomerAddress,
                            customerAddressInstructions: formattedCustomerAddress,
                            addressDetailed: {
                                street: customerAddress.street,
                                unit: customerAddress.apartment,
                                city: customerAddress.city,
                                zip: '',
                                state: customerAddress.state
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
                        console.error('Error en la solicitud POST a cleancloudapp.com:', error.response.data);
                    }
                    /************************************************** */
                } else {

                    console.log('El contacto no tiene las etiquetas designadas, no se realizará la solicitud POST.');
                }
            } //aqui
        }
    } catch (error) {
        console.error('Error al obtener datos desde Clientify API:', error.response.data);
    }
};

setInterval(async () => {
    console.log('Ejecutando fetchDataAndPost...');
    await fetchDataAndPost();
}, 60 * 500); // Cada 500 segundos (aproximadamente cada 8 minutos)
