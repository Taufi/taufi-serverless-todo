import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

// import { verify, decode } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = '...'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJKdL9YfRFIbVnMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1wdzF6anV5cS5ldS5hdXRoMC5jb20wHhcNMjAwODI5MTI1OTEzWhcN
MzQwNTA4MTI1OTEzWjAkMSIwIAYDVQQDExlkZXYtcHcxemp1eXEuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAswGo9mHrB7Mhle19
/XPNHFT8AxpTjaKkjuEMEV+ms6GU1wv1qC4C7kEr2tAWGCWrWZKQFLjfWExSOovD
eqSbhctaeNCnQqNnoKm6Q1Ij9giOL51XmW91gTuRyCx+YeUeduDPyyzemPLIQqWh
EV9B1L5tKDAefOaYDuetQWxY6ZfyNZtARGIw7AFezmuTDGFNhPEuYLtUYH1xElTO
bY5Xn/Fe0q4N2zY3Uj+WkVR2jMH6TQtTq9Gmlx1vIXWy/zzjQ6pU4idCAN80tuwO
yI+kNO3uTVib2eNXsZUiCekY7guyqx5NfO8CbRdcxXkukapI6SLf2OgJm8OWY74t
zRYwEwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSFvqzBjft1
PpDnIDbwoKcbAhJc2TAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AFynzSVYe6B7KhbBXgeBcSdfc1KhqBVy+nn/mqbKxQLpyuNcazxFRScpBafVu6KV
9OJSttzdRLQT/tMxHtzMTfQpCL+MDKUmQpDlw/BfxEguRUJhkEcYhQAXl7uErs5J
Cv+mgBwInC3/W6++pV1p4W/hdPxqHYsNonuC2zxHXiLCStMDM+9KkHuZ/igz0DPv
JmBrqIgcqzm4yAubj/Mmhy1d/sc+fOFL49ZdibVQ35YFjZ47AuUUMgV3ksYcbz6G
Zt0C4IfVqhOkJkdY7+WYVfBQ42j3y53zQp+EC5ZvePmH6W0j11rlikuE0QpYIdcX
7lARN7lp3ZNmMsNN0Kaj5+o=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    // const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

// async function verifyToken(authHeader: string): Promise<JwtPayload> {

//   const token = getToken(authHeader)  
//   const jwt: Jwt = decode(token, { complete: true }) as Jwt

//   const playLoad = jwt.payload

//   return ver
//   // TODO: Implement token verification
//   // You should implement it similarly to how it was implemented for the exercise for the lesson 5
//   // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
//   return undefined
// }

function verifyToken(authHeader: string): JwtPayload {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}
