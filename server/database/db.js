import mongoose  from 'mongoose';

const Connection = async () => {
    const URL = ``
    try {
        await mongoose.connect(URL);
        console.log('Database connected successfully');
    } catch (error) {   
        console.log('Error while connecting with the database ', error);
    }
}

export default Connection;

