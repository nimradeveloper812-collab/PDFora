# -----------------------------------
# Stage 1: Build React Frontend
# -----------------------------------
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# -----------------------------------
# Stage 2: Build .NET Backend
# -----------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src
COPY backend/PDFora.Backend.csproj backend/
RUN dotnet restore backend/PDFora.Backend.csproj
COPY backend/ backend/
WORKDIR /src/backend
RUN dotnet publish PDFora.Backend.csproj -c Release -o /app/publish

# -----------------------------------
# Stage 3: Final Production Image
# -----------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Install LibreOffice, Ghostscript, ImageMagick, and full multilingual fonts for PDF processing
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libreoffice \
    ghostscript \
    imagemagick \
    fonts-liberation \
    fonts-dejavu \
    fonts-noto-core \
    fonts-noto-cjk \
    fonts-noto-extra \
    fonts-noto-ui-core \
    && (sed -i 's/rights="none" pattern="PDF"/rights="read | write" pattern="PDF"/' /etc/ImageMagick-*/policy.xml 2>/dev/null || true) \
    && rm -rf /var/lib/apt/lists/*

ENV ASPNETCORE_URLS=http://+:80;http://+:8080;http://+:10000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 80
EXPOSE 8080
EXPOSE 10000

# Copy the published .NET backend
COPY --from=backend-build /app/publish .

# Copy the built React frontend into the wwwroot folder so .NET can serve it
COPY --from=frontend-build /app/dist ./wwwroot

ENTRYPOINT ["dotnet", "PDFora.Backend.dll"]
