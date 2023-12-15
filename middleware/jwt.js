const jwt = require('jsonwebtoken')
const jwtConfig = {
    sign(payload,secretKey){
        const token = jwt.sign(payload,secretKey)
        return token

    },
    verifyUser(req, res, next){
      const authHeader = req.headers.authorization;
      // const secretKey = req.headers.secretkey;
      try{
        if(authHeader){
            const [bearer,token,secretKey,email] = authHeader.split(" ");;
              jwt.verify(token, secretKey, function (err, decoded) {
                if (err) {
                    // console.log(typeof(token) , typeof(secretKey))
                    res.status(401).send("JWT authentication failed");
                     
                }
                else {
                    // res.status(200).send("JWT authentized");
               res.status(200);
                    next()
    
                }
            })
            }
            else{
              res.status(402).send("Enter headers")
            }
        }
        catch(error){
            // console.log(err);
            res.status(520).send(error)
        }
        
    }
    
}



module.exports = jwtConfig
