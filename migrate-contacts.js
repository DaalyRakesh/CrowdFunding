const mongoose = require('mongoose');
const Contact = require('./models/Contact');
require('dotenv').config();

async function migrateContacts() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas');

        // Find all contacts that don't have phone or address fields
        const contacts = await Contact.find({
            $or: [
                { phone: { $exists: false } },
                { address: { $exists: false } }
            ]
        });

        console.log(`Found ${contacts.length} contact records to migrate`);

        // Update each contact
        for (const contact of contacts) {
            console.log(`Migrating contact: ${contact._id} (${contact.name})`);

            // Set default values for phone and address
            const phone = '91-8861520635'; // Default phone number
            const address = 'Address not provided (migrated record)';
            
            const updateData = {
                $set: { 
                    phone: phone, 
                    address: address
                }
            };
            
            // If website exists, remove it
            if (contact.website !== undefined) {
                updateData.$unset = { website: 1 };
            }
            
            // Update the contact record
            await Contact.updateOne(
                { _id: contact._id },
                updateData
            );
            
            console.log(`Migrated contact: ${contact._id}`);
        }

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the migration
migrateContacts(); 