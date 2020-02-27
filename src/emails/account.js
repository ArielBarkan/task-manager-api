const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// WELCOME EMAIL
const welcome = (user) => {

    console.log(user);
    const msg = {
        to: user.email,
        from: 'arielbarkan@gmail.com',
        subject: 'Welcome to task app',
        text: `Hi ${user.name}, I'm very happy to see you joining to my buggy app`
    };
    //ES6
    sgMail
        .send(msg)
        .then(() => {
            console.log('ok')
        }, console.error);

}

// CANCEL ACCOUNT 
const goodbye = (user) => {

    console.log(user);
    const msg = {
        to: user.email,
        from: 'arielbarkan@gmail.com',
        subject: 'Sad to see you go...',
        text: `Hi ${user.name}, I'm very sad to see you go`
    };
    //ES6
    sgMail
        .send(msg)
        .then(() => {
            console.log('ok')
        }, console.error);

}

module.exports = {
    welcome,
    goodbye
}