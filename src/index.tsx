import type {
  OnTransactionHandler,
  OnInstallHandler,
} from '@metamask/snaps-sdk'
import { Box, Heading, Text, Bold, Divider } from '@metamask/snaps-sdk/jsx'

const API = 'https://tranzguard.com/api/verify-address'

function detectChain(chainId: string): string {
  // CAIP-2 format from MetaMask: "eip155:1" → ethereum, etc.
  const id = chainId.startsWith('eip155:')
    ? `0x${Number(chainId.slice(7)).toString(16)}`
    : chainId
  const map: Record<string, string> = {
    '0x1': 'ethereum',
    '0x38': 'bnb',
    '0x89': 'polygon',
    '0xa4b1': 'arbitrum',
    '0xa': 'optimism',
    '0xa86a': 'avalanche',
    '0x2105': 'base',
  }
  return map[id] || 'ethereum'
}

type ApiResp = {
  safe: boolean
  risk_score: number
  flags: string[]
  sources: string[]
  recommendation: string
  latency_ms: number
}

export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
}) => {
  try {
    const toAddress = (transaction as { to?: string }).to
    if (!toAddress) {
      return {
        content: (
          <Box>
            <Text>Contract deployment — no destination to verify.</Text>
          </Box>
        ),
      }
    }

    const chain = detectChain(chainId)
    // base64-encode address — Cloudflare WAF on the production endpoint
    // flags raw hex addresses in request bodies. Server accepts either.
    const addressB64 =
      typeof btoa === 'function'
        ? btoa(toAddress)
        : Buffer.from(toAddress, 'utf8').toString('base64')
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addressB64, chain }),
    })

    if (!res.ok) {
      return {
        content: (
          <Box>
            <Text>
              TranzGuard: Check unavailable. Verify address manually at
              tranzguard.com/check.
            </Text>
          </Box>
        ),
      }
    }

    const data = (await res.json()) as ApiResp

    if (data.safe) {
      return {
        content: (
          <Box>
            <Heading>✅ TranzGuard Shield</Heading>
            <Text>
              Address verified safe across <Bold>44 threat feeds</Bold>.
            </Text>
            <Divider />
            <Text>
              Risk score: <Bold>{`${data.risk_score}/100`}</Bold>
            </Text>
            <Text>Sources: {data.sources?.join(', ')}</Text>
            <Text>Powered by TranzGuard</Text>
          </Box>
        ),
      }
    }

    return {
      content: (
        <Box>
          <Heading>❌ TranzGuard Shield — STOP</Heading>
          <Text>
            <Bold>DO NOT SEND TO THIS ADDRESS</Bold>
          </Text>
          <Divider />
          <Text>
            Risk score: <Bold>{`${data.risk_score}/100`}</Bold>
          </Text>
          <Text>
            Flags: <Bold>{data.flags?.join(', ')}</Bold>
          </Text>
          <Text>{data.recommendation}</Text>
          <Divider />
          <Text>Verify at tranzguard.com/check</Text>
        </Box>
      ),
      severity: 'critical',
    }
  } catch (_e) {
    return {
      content: (
        <Box>
          <Text>
            TranzGuard: Unable to verify. Check the address at
            tranzguard.com/check before sending.
          </Text>
        </Box>
      ),
    }
  }
}

export const onInstall: OnInstallHandler = async () => {
  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: (
        <Box>
          <Heading>TranzGuard Shield Installed ✅</Heading>
          <Text>
            Every transaction will now be verified against 44 real-time threat
            intelligence feeds before you sign.
          </Text>
          <Text>
            Clipboard hijacking, address poisoning, and known drainers are
            flagged automatically.
          </Text>
          <Text>tranzguard.com</Text>
        </Box>
      ),
    },
  })
}
