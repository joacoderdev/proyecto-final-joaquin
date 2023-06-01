import dotenv from "dotenv";
dotenv.config();
import express from "express"
import nodemailer from 'nodemailer'
import { CORREO_EMAIL, PASSWORD_EMAIL, mongooseConnectStringToAtlas } from "../config/servidor.config.js"
import { productsRouter } from "../routers/productsRouter.js";
import { engine } from 'express-handlebars'
import { cartsRouter } from "../routers/cartsRouter.js";
import { viewsRouter } from "../routers/viewsRouter.js";
import { userRouterOtr } from "../routers/userSessionRouter.js";
import { userRouterr } from "../routers/user.routes.js";
import { cartsRouterFileSystem } from "../routers/cartsRouterFileSystem.js";
import mongoose from 'mongoose';
import {Server as IOServer} from 'socket.io'
import { productModel } from "../../Dao/DBaaS/models/productModel.js";
import { chatModel } from "../../Dao/DBaaS/models/chatModel.js";
import { passportInitialize , passportSession } from "../middlewares/passport.js";
import session from "../middlewares/session.js";
import { errorHandlerAPI } from "../middlewares/errorMiddleware.js";
import cookieParser from "cookie-parser";
import { COOKIE_SECRET } from "../config/auth.config.js";
import { getCurrentUser } from "../middlewares/authenticator.js";
import __dirname from "../utils.js";
import swaggerUi from "swagger-ui-express"
import { swaggerSpecs } from "../config/swagger.config.js";
import mockingrouter from "../routers/mocking.routes.js";
import { logger } from "../logger.js"
import loggerRoutes from "../routers/loggerRoutes.js"


mongoose.connect(mongooseConnectStringToAtlas) // =>  REEMPLAZAR PARA CONECTAR A BD ATLAS..

const app = express();
app.use(session)

app.use(cookieParser(COOKIE_SECRET))

app.use("/api/products",productsRouter);
app.use("/api/carts",cartsRouter);
app.use("/api/views",viewsRouter);
app.use("/api/fs/carts",cartsRouterFileSystem);
app.use("/api/users" ,userRouterOtr) 
app.use("/api/userss" ,userRouterr) 
app.use("/api/docs",swaggerUi.serve,swaggerUi.setup(swaggerSpecs));
app.use("/api/mockingproducts", mockingrouter)

app.use(express.static('./public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.url}`);
    next();
  });

  app.use("/api/loggerTest", loggerRoutes);




app.engine('handlebars', engine())
app.set('views', './views')
app.set('view engine', 'handlebars')

app.use(passportInitialize, passportSession)

app.get("/", (req, res, next)=>{
    res.render("home")
})
app.get("/api/session/current", getCurrentUser)

app.get('/mail',async(req,res)=>{
    let result = await transport.sendMail({
        from: 'Coder Tests <joacoder.dev@gmail.com>',
        to:'joacoder.dev@gmail.com',
        subject:'correo de prueba',
        html:`
        <div>
            <h1>Esto es un test</h1>
            <img src="cid:river"/>
        </div>
        `,
        attachments:[{
            filename:'river.jpg',
            path:__dirname+'/imagenes/river.png',
            cid:'river'
        }]    
    })
    res.send({status:"success",result:"Email Sent"})

})
app.get('/operacionsencilla', (req, res) => {
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
        sum += i
    } 
    res.send({ sum });
})
app.get('/operacioncompleja', (req, res) => {
    let sum = 0;
    for (let i = 0; i < 5e8; i++) {
        sum += i
    } 
    res.send({ sum });
})

const transport =nodemailer.createTransport({
    service:'gmail',
    port:587,
    auth:{
        user:CORREO_EMAIL,
        pass:PASSWORD_EMAIL
    }
})


app.use(errorHandlerAPI)

const PORT = process.env.PORT


const httpServer = app.listen(PORT, () => console.log("Corriendo el servidor exitosamente"))

export const io = new IOServer(httpServer)

/* envio de socket al req, PARA PODER USAR EL SOCKET EN CUALQUIER PETICION? */
app.use((req, res, next) => {
    req['io'] = io
    next()
})

io.on('connection', async clientSocket=>{ 
    //conexion chat
    io.emit('newChatClient', await chatModel.find())

    clientSocket.on('newMessage', async message=>{     
    await chatModel.create({ user:  message["user"] , message:  message["message"] })
    io.emit("updateMessages", await chatModel.find() )
    })

    clientSocket.on('newUser', async user=>{    
        clientSocket.broadcast.emit("newUser", user)
    })


    //PRODUCT SOCKET
    console.log("nuevo cliente conectado", clientSocket.id)
    io.emit('newClient',  await productModel.find())

    //ACTUALIZAR AL HABER CAMBIOS
    clientSocket.on('actualizar', async ()=>{  
        io.emit('actualizarRender', await productModel.find())
   })
   clientSocket.on('actualizarProductsRenders', async () =>{    
    const prodUpdated = await productModel.find();
    io.emit('actualizarRender', await productModel.find() )    
    })

   clientSocket.on('eliminarProducto', async id=>{
        await productModel.findByIdAndDelete(id);
        io.emit('actualizarRender', await productModel.find())
   })

   clientSocket.on('eliminarProducto', async () =>{
    io.emit('actualizarRender', await productModel.find())    
    })

})