#import <UIKit/UIKit.h>

@interface ReactRootView : UIView

+ (UIView *)rootViewWithBundleURL:(NSURL *)bundleURL moduleName:(NSString *)moduleName initialProperties:(NSDictionary *)initialProperties launchOptions:(NSDictionary *)launchOptions;

@end
