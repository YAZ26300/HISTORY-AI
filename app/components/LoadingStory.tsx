export default function LoadingStory() {
  return (
    <div className="text-center mt-8 space-y-6">
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 animate-spin">
          <svg className="w-full h-full text-primary" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
              opacity=".25"
            />
            <path
              fill="currentColor"
              d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
            />
          </svg>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xl font-semibold text-primary">
          Création de votre histoire magique...
        </p>
        <p className="text-gray-600">
          Notre conteur travaille sur une histoire unique pour vous
        </p>
      </div>
      <div className="flex justify-center space-x-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
} 