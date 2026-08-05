import 'package:flutter/material.dart';

class Login extends StatelessWidget {
  const Login({super.key});
  @override
  Widget build(BuildContext context){
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child:Padding(padding:EdgeInsetsGeometry.symmetric(horizontal: 24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
Icon(Icons.flutter_dash,size: 90,color: Colors.blue,),
SizedBox(height: 20,),
Text("Welcome",style: TextStyle(fontSize: 28,fontWeight: FontWeight.bold),),
TextField(
  decoration: InputDecoration(
    hintText: "Email",
    prefixIcon: Icon(Icons.email),
    filled: true,
    fillColor: Colors.grey.shade200
  ),
),
SizedBox(height: 20,),

TextField(
  decoration: InputDecoration(
    hintText: "Password",
    prefixIcon: Icon(Icons.lock),
    filled: true,
    fillColor: Colors.grey.shade200
  ),
),
SizedBox(height: 20,),
Align(
  alignment: AlignmentGeometry.centerRight,
  child: TextButton(onPressed: (){}, child:Text("Forget Password")),
),
SizedBox(height: 20,),
SizedBox(width: double.infinity,
height: 55,
child: ElevatedButton(onPressed: (){},
style:ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
 child:Text("Login")),
),
          ],
        ),
        ) ),
    );
  }
}