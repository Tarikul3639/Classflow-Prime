import { ImageResponse } from 'next/og'

export const alt = 'ClassFlow Prime Dashboard Preview'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: '80px',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Top Section - Logo & Title */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                    {/* Mock Logo Icon */}
                    <div
                        style={{
                            width: '80px',
                            height: '80px',
                            background: '#0070f3',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '24px',
                            fontSize: '48px',
                            color: 'white',
                            fontWeight: 'bold',
                        }}
                    >
                        C
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h1
                            style={{
                                fontSize: '72px',
                                margin: 0,
                                color: '#111',
                                fontWeight: '800',
                                letterSpacing: '-0.05em',
                            }}
                        >
                            ClassFlow Prime
                        </h1>
                    </div>
                </div>

                {/* Feature List Section */}
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
                    {[
                        'Centralized Class Operations',
                        'Communication & Updates',
                        'Exams & Viva Schedules',
                        'Group Coordination',
                    ].map((feature, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '32px',
                                color: '#444',
                                marginBottom: '16px',
                            }}
                        >
                            {/* Blue Dot */}
                            <div
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    background: '#0070f3',
                                    borderRadius: '50%',
                                    marginRight: '16px',
                                }}
                            />
                            {feature}
                        </div>
                    ))}
                </div>

                {/* Footer with Domain */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '40px',
                        right: '80px',
                        fontSize: '24px',
                        color: '#888',
                    }}
                >
                    classflow-prime.vercel.app
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}