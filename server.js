import express from 'express';
import connectDatabase from './config/db';
import { check, validationResult } from 'express-validator';
import cors from 'cors';
import User from './models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';
import auth from './middleware/auth';
import Order from './models/Order';


const app = express();


connectDatabase();

app.use(express.json({ extended: false}));
app.use(
    cors({
        origin: 'http://localhost:3000'
    })
);


app.get('/', (req, res) =>
    res.send('http get pizza request sent to root api toppings endpont')
);


app.post(
    '/api/users',
    [
        check('firstName', 'Please enter your first name')
            .not()
            .isEmpty(),
        check('lastName', 'Please enter your last name')
            .not()
            .isEmpty(),
        check('username', 'Please enter your username')
            .not()
            .isEmpty(),
        check('email', 'Please enter a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({ min : 6 })
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array() });
        } else {
            const { firstName, lastName, username, email, password } = req.body;
            try {
                
                let user = await User.findOne({ email: email });
                if (user) {
                    return res
                    .status(400)
                    .json({ errors: [{ msg: 'User already exists' }] });
                }

                user = new User({
                    firstName: firstName,
                    lastName: lastName,
                    username: username,
                    email: email,
                    password: password
                });


                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);


                await user.save();

                // const payload = {
                //    user: {
                //      id: user.id
                //    }
                // };

                // jwt.sign(
                //    payload,
                //    config.get('jwtSecret'),
                //    { expiresIn: '10hr' },
                //    (err, token) => {
                //        if (err) throw err;
                //        res.json({ token: token});
                //    }
                // );

                returnToken(user, res);


            } catch (error){
                res.status(500).send('Server error 500!');
            }
        }
    }
);

app.get('/api/auth', auth, async (req, res) => {
    try {
        const user =  await User.findById(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send('Unknown server error')
    }
});


app.post(
    '/api/login',
    [
        check('username', 'Please enter your username')
        .not()
        .isEmpty(),
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'A password is required').exists()
        
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } else {
            const { username, email, password } = req.body;
            try {
                
                let user = await User.findOne({ email: email });
                if (!user) {
                    return res
                    .status(400)
                    .json({ errors: [{ msg: 'Bogus email or password' }] });
                }


                const match = await bcrypt.compare(password, user.password);
                if(!match){
                    return res
                    .status(400)
                    .json({ errors: [{ msg: 'Bogus email or password'}] });
                }

                const match2 = await bcrypt.compare(username, user.username);
                if(!match){
                    return res
                    .status(400)
                    .json({ errors: [{ msg: 'Bogus username'}] });
                }

                returnToken(user, res);

            } catch (error){
                res.status(500).send('Server error');
            }
        }
    }
);

const returnToken = (user, res) => {
    const payload = {
        user: {
          id: user.id
        }
    };
    
    jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '10hr' },
        (err, token) => {
            if (err) throw err;
            res.json({ token: token});
        }
    );
};


app.post(
    '/api/orders',
    [
       auth,
        [
            check('title', 'Title text is required')
            .not()
            .isEmpty(),
            check('body', 'Body text is required')
            .not()
            .isEmpty()
        ]
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
           res.status(400).json({ errors: errors.array() });
        } else {
            const { title, body } = req.body;
            try {
                
                const user = await User.findById(req.user.id);

                const order =new Order({
                    user: user.id,
                    title: title,
                    body: body
                });

                await order.save();

                res.json(order);
            } catch (error){
                console.error(error)
                res.status(500).send('Server error');
            }
        }
    }
);

app.get('/api/orders', auth, async (req, res) => {
    try {
        const orders =  await Order.find().sort({ date: -1 });

        res.json(orders);

    } catch (error) {
        console.error(error)
        res.status(500).send('Server error')
    }
});

app.get('/api/users', auth, async (req, res) => {
    try {
        const users =  await User.find().sort({ date: -1 });

        res.json(users);

    } catch (error) {
        console.error(error)
        res.status(500).send('Server error')
    }
});

app.get('/api/orders/:id', auth, async (req, res) => {
    try {
        const order =  await Order.findById(req.params.id);

       if(!order){
        return res.status(404).json({ msg: 'Bummer, order not found'});
       }
       
    
        res.json(order);
    } catch (error) {
        console.error(error)
        res.status(500).send('Server error')
    }
});

app.delete('/api/orders/:id', auth, async (req, res) => {
    try {
        const order =  await Order.findById(req.params.id);

       if(!order){
        return res.status(404).json({ msg: 'Bummer, order not found'});
       }

       if (order.user.toString() != req.user.id) {
        return res.status(401).json({msg: 'Pizza clearance violation! User not authorized' });
       }

       await order.remove();
       

        res.json({msg: 'Post removed'});
    } catch (error) {
        console.error(error)
        res.status(500).send('Server error')
    }
});


app.put('/api/orders/:id', auth, async (req, res) => {
    try {

        const { title, body } = req.body;
        const order =  await Order.findById(req.params.id);

       if(!order){
        return res.status(404).json({ msg: 'Bummer, order not found'});
       }

       if (order.user.toString() != req.user.id) {
        return res.status(401).json({msg: 'Pizza clearance violation! User not authorized' });
       }

       order.title = title || order.title;
       order.body = body || order.body;

       await order.save();

        res.json(order);
    } catch (error) {
        console.error(error)
        res.status(500).send('Server error')
    }
});


const port = 5000;
app.listen(port, () => console.log(`Express server running on port ${port}`));