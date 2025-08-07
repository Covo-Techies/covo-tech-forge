import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import { Users, Award, Truck, Shield, Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  const stats = [
    { label: "Happy Customers", value: "100+", icon: Users },
    { label: "Years of Experience", value: "2+", icon: Award },
    { label: "Orders Delivered", value: "500+", icon: Truck },
    { label: "Quality Guarantee", value: "100%", icon: Shield },
  ];

  const values = [
    {
      icon: Star,
      title: "Quality First",
      description: "We never compromise on quality. Every product goes through rigorous testing before reaching our customers."
    },
    {
      icon: Heart,
      title: "Customer Satisfaction",
      description: "Your satisfaction is our priority. We provide exceptional customer service and support."
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Shop with confidence knowing your data is secure and transactions are protected."
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable shipping to get your orders to you as fast as possible."
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b602",
      description: "Passionate about creating amazing shopping experiences"
    },
    {
      name: "Michael Chen",
      role: "Head of Product",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      description: "Ensuring every product meets our high standards"
    },
    {
      name: "Emily Rodriguez",
      role: "Customer Success",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      description: "Dedicated to helping customers find what they need"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About Our <span className="text-primary">Story</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            We're passionate about bringing you the best products with exceptional service. 
            Our journey started with a simple mission: to make online shopping delightful and trustworthy.
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Est. 2025
          </Badge>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <stat.icon className="h-8 w-8 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              To revolutionize the e-commerce experience by providing high-quality products, 
              exceptional customer service, and innovative solutions that exceed expectations. 
              We believe that shopping should be simple, secure, and enjoyable for everyone.
            </p>
          </CardContent>
        </Card>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <value.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Shop?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Discover our amazing collection of products and experience the difference. 
              Join thousands of satisfied customers who trust us for their shopping needs.
            </p>
            <Button size="lg" className="mr-4" asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}