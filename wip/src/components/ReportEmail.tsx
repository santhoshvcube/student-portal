import React from 'react';
import { Html, Head, Body, Container, Text, Section, Row, Column } from '@react-email/components';

interface ReportEmailProps {
  studentName: string;
  batchNumber: string;
  month: string;
  classAttendance: string;
  labAttendance: string;
  totalExamMarks: number;
  totalMockMarks: number;
  projectsCompleted: number;
  remarks: string;
}

const ReportEmail: React.FC<ReportEmailProps> = ({
  studentName,
  batchNumber,
  month,
  classAttendance,
  labAttendance,
  totalExamMarks,
  totalMockMarks,
  projectsCompleted,
  remarks
}) => {
  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Text style={headerStyle}>Monthly Performance Report</Text>
          
          <Section style={sectionStyle}>
            <Row>
              <Column style={labelStyle}>Student Name:</Column>
              <Column style={valueStyle}>{studentName}</Column>
            </Row>
            <Row>
              <Column style={labelStyle}>Batch:</Column>
              <Column style={valueStyle}>{batchNumber}</Column>
            </Row>
            <Row>
              <Column style={labelStyle}>Month:</Column>
              <Column style={valueStyle}>{month}</Column>
            </Row>
          </Section>
          
          <Section style={sectionStyle}>
            <Text style={subheaderStyle}>Attendance</Text>
            <Row>
              <Column style={labelStyle}>Class Attendance:</Column>
              <Column style={valueStyle}>{classAttendance}</Column>
            </Row>
            <Row>
              <Column style={labelStyle}>Lab Attendance:</Column>
              <Column style={valueStyle}>{labAttendance}</Column>
            </Row>
          </Section>
          
          <Section style={sectionStyle}>
            <Text style={subheaderStyle}>Performance</Text>
            <Row>
              <Column style={labelStyle}>Total Exam Marks:</Column>
              <Column style={valueStyle}>{totalExamMarks}</Column>
            </Row>
            <Row>
              <Column style={labelStyle}>Total Mock Marks:</Column>
              <Column style={valueStyle}>{totalMockMarks}</Column>
            </Row>
            <Row>
              <Column style={labelStyle}>Projects Completed:</Column>
              <Column style={valueStyle}>{projectsCompleted}</Column>
            </Row>
          </Section>
          
          <Section style={sectionStyle}>
            <Text style={subheaderStyle}>Remarks</Text>
            <Text style={remarksStyle}>{remarks}</Text>
          </Section>
          
          <Text style={footerStyle}>
            This is an automated report. Please contact your administrator for any questions.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const bodyStyle = {
  backgroundColor: '#f5f5f5',
  fontFamily: 'Arial, sans-serif',
  padding: '20px',
};

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const headerStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a237e',
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const subheaderStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1a237e',
  margin: '10px 0',
};

const sectionStyle = {
  marginBottom: '20px',
  paddingBottom: '20px',
  borderBottom: '1px solid #e0e0e0',
};

const labelStyle = {
  fontWeight: 'bold',
  width: '40%',
  padding: '5px 0',
};

const valueStyle = {
  width: '60%',
  padding: '5px 0',
};

const remarksStyle = {
  fontStyle: 'italic',
  color: '#555',
};

const footerStyle = {
  fontSize: '12px',
  color: '#777',
  textAlign: 'center' as const,
  marginTop: '20px',
};

export default ReportEmail;