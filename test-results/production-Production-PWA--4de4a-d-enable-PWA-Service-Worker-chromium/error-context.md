# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e4]:
      - img "AirBear Logo" [ref=e6]
      - generic [ref=e7]:
        - heading "Welcome to AirBear" [level=1] [ref=e8]
        - paragraph [ref=e9]: Solar-powered rideshare with onboard mobile bodegas. Sustainable transportation meets convenience.
      - generic [ref=e10]:
        - link "Book a Ride" [ref=e11] [cursor=pointer]:
          - /url: /map
          - img
          - text: Book a Ride
        - link "Shop Bodega" [ref=e12] [cursor=pointer]:
          - /url: /products
          - img
          - text: Shop Bodega
      - generic [ref=e13]:
        - generic [ref=e14]:
          - img [ref=e15]
          - heading "Eco-Friendly" [level=3] [ref=e18]
          - paragraph [ref=e19]: 100% solar-powered vehicles for sustainable transportation
        - generic [ref=e20]:
          - img [ref=e21]
          - heading "Real-Time Tracking" [level=3] [ref=e23]
          - paragraph [ref=e24]: Track your ride and nearby AirBears in real-time on the map
        - generic [ref=e25]:
          - img [ref=e26]
          - heading "Mobile Bodega" [level=3] [ref=e29]
          - paragraph [ref=e30]: Shop essentials onboard during your ride with secure payments
  - region "Notifications (F8)":
    - list
  - alert [ref=e31]
```