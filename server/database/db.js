import mongoose  from 'mongoose';

const Connection = async () => {
    const URL = `mongodb+srv://ahmedareebkhalil:AY49vYdEPurs1b8y@cluster1.jj9g7.mongodb.net/`
    try {
        await mongoose.connect(URL);
        console.log('Database connected successfully');
    } catch (error) {   
        console.log('Error while connecting with the database ', error);
    }
}

export default Connection;

