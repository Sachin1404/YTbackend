class Apierrors extends Error{
    constructor(statuscode,message="something went wrong",errors=[],stack){
        super(message)
        this.errors=errors
        this.statusCode=statuscode
        this.data=null
        this.success=false
        if(stack){
            this.stack=stack
        }
        else{
            Error.captureStackTrace(this,this.contructor)
        }
    }
}
export {Apierrors}