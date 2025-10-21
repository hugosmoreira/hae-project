import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About</h1>
      <div className="prose max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          Housing Authority Exchange is a dedicated platform for housing authority professionals 
          to connect, share knowledge, and learn from each other's experiences.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4 text-civic-blue">Our Mission</h2>
        <p className="mb-6">
          We believe that collaboration and knowledge sharing are essential to improving 
          housing services across communities. Our platform provides a space where 
          professionals can ask questions, share best practices, and stay informed 
          about industry trends.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-civic-blue">Features</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Discussion forums for peer-to-peer learning</li>
          <li>Searchable knowledge base of best practices</li>
          <li>Community polls for gathering insights</li>
          <li>Performance benchmarking tools</li>
          <li>Regional networking opportunities</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 text-civic-blue">Privacy & Security</h2>
        <p>
          We take privacy seriously. Your email address is never displayed to other users, 
          and we only show your role and region to help facilitate relevant connections 
          within the housing authority community.
        </p>
      </div>
    </div>
  );
};

export default About;