// create-account.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Section,
  Text
} from '@react-email/components'

import * as React from 'react'

interface CreateAccountEmailProps {
  email: string
  password: string
  title: string
}

const logoUrl = 'https://img.pikbest.com/png-images/20241030/dining-bliss-restaurant-logo_11024921.png!w700wp'

export const CreateAccountEmail = ({ email, password, title }: CreateAccountEmailProps) => (
  <Html>
    <Head>
      <title>{title}</title>
    </Head>
    <Body style={main}>
      <Container style={container}>
        <Img src={logoUrl} width='212' height='88' alt='Logo' style={logo} />
        <Text style={tertiary}>Tài khoản mới</Text>
        <Heading style={secondary}>Chào mừng bạn đến với Scanorderly!</Heading>
        <Text style={paragraph}>
          Tài khoản của bạn đã được tạo thành công. Dưới đây là thông tin đăng nhập:
        </Text>

        <Section style={credentialsContainer}>
          <Text style={credentialLabel}>Email:</Text>
          <Text style={credentialValue}>{email}</Text>

          <Text style={credentialLabel}>Mật khẩu:</Text>
          <Section style={passwordContainer}>
            <Text style={passwordStyle}>{password}</Text>
          </Section>

        </Section>



        <Text style={warningText}>
    ⚠️ Lưu ý: Vui lòng lưu giữ thông tin này một cách an toàn và không chia sẻ với bất kỳ ai.
        </Text>

        <Text style={paragraph}>
          <Button style={loginButton} href="https://scanorderly.com/login">
            Đăng nhập ngay
          </Button>
        </Text>
      </Container>
      <Text style={footer}>From Scanorderly with ❤️.</Text>
    </Body>
  </Html>
)

CreateAccountEmail.PreviewProps = {
  email: 'user@example.com',
  password: 'TempPass123!',
  title: 'Tài khoản mới được tạo'
} as CreateAccountEmailProps

export default CreateAccountEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif'
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #eee',
  borderRadius: '5px',
  boxShadow: '0 5px 10px rgba(20,50,70,.2)',
  marginTop: '20px',
  maxWidth: '400px',
  margin: '0 auto',
  padding: '68px 0 130px'
}

const logo = {
  margin: '0 auto',
  width: '70px',
  height: '70px',
  borderRadius: '100%'
}

const tertiary = {
  color: '#0a85ea',
  fontSize: '11px',
  fontWeight: 700,
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  height: '16px',
  letterSpacing: '0',
  lineHeight: '16px',
  margin: '16px 8px 8px 8px',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const
}

const secondary = {
  color: '#000',
  // display: 'inline-block',
  fontFamily: 'HelveticaNeue-Medium,Helvetica,Arial,sans-serif',
  fontSize: '20px',
  fontWeight: 500,
  lineHeight: '24px',
  marginBottom: '0',
  marginTop: '0',
  textAlign: 'center' as const
}

const credentialsContainer = {
  margin: '24px auto',
  padding: '0 40px'
}

const credentialLabel = {
  color: '#666',
  fontSize: '14px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  fontWeight: 600,
  margin: '16px 0 4px 0',
  textAlign: 'left' as const
}

const credentialValue = {
  color: '#000',
  fontSize: '16px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  fontWeight: 500,
  margin: '0 0 8px 0',
  padding: '8px 12px',
  backgroundColor: '#f8f9fa',
  borderRadius: '4px',
  border: '1px solid #e9ecef',
  textAlign: 'center' as const
}

const passwordContainer = {
  background: 'rgba(0,0,0,.05)',
  borderRadius: '4px',
  margin: '0',
  padding: '0'
}

const passwordStyle = {
  color: '#000',
  display: 'inline-block',
  fontFamily: 'HelveticaNeue-Bold',
  fontSize: '18px',
  fontWeight: 700,
  letterSpacing: '2px',
  lineHeight: '24px',
  paddingBottom: '12px',
  paddingTop: '12px',
  margin: '0 auto',
  width: '100%',
  textAlign: 'center' as const,
  backgroundColor: '#f8f9fa',
  borderRadius: '4px',
  border: '1px solid #e9ecef'
}

const paragraph = {
  color: '#444',
  fontSize: '15px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  letterSpacing: '0',
  lineHeight: '23px',
  padding: '0 40px',
  margin: '16px 0',
  textAlign: 'center' as const
}

const warningText = {
  color: '#d63384',
  fontSize: '13px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  letterSpacing: '0',
  lineHeight: '20px',
  padding: '0 40px',
  margin: '20px 0',
  textAlign: 'center' as const,
  backgroundColor: '#fff5f5',
  borderRadius: '4px',
  border: '1px solid #f5c2c7'
}

const footer = {
  color: '#000',
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '0',
  lineHeight: '23px',
  margin: '0',
  marginTop: '20px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const
}

const loginButton = {
  backgroundColor: '#4f46e5',
  borderRadius: '8px',
  color: '#ffffff',
  // display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1',
  padding: '14px 28px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)'
}
